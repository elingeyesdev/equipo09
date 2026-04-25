import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseRepository } from '../../../common/database';
import { Investment, InvestmentResult, InvestmentHistoryItem, mapRowToInvestment, mapRowToInvestmentHistoryItem } from '../models/investment.model';
import { InvestmentDto } from '../dto/investment.dto';

@Injectable()
export class InvestmentsRepository extends BaseRepository {
  /**
   * Motor transaccional SQL: Descuenta saldo simulado, actualiza la campaña
   * y registra la inversión utilizando bloqueos pesimistas (FOR UPDATE)
   * 
   */
  async createInvestmentTransaction(userId: string, dto: InvestmentDto): Promise<InvestmentResult> {
    return this.transaction(async (client) => {
      // 1. Read & Lock Investor Profile (Pessimistic Write Lock)
      const investorResult = await client.query(
        `SELECT max_investment, total_invested FROM investor_profiles WHERE user_id = $1 FOR UPDATE`,
        [userId]
      );

      if (investorResult.rows.length === 0) {
        throw new BadRequestException('El perfil de inversor no existe o no tiene saldo configurado.');
      }

      const investor = investorResult.rows[0];
      const maxInvestment = Number(investor.max_investment) || 0;
      const totalInvested = Number(investor.total_invested) || 0;
      const availableCapital = maxInvestment - totalInvested;

      // 2. Validar que el saldo simulado disponible sea suficiente
      if (availableCapital < dto.amount) {
        throw new BadRequestException('Saldo simulado insuficiente para realizar esta inversión.');
      }

      // 3. Validar estado de la campaña y aplicar bloqueo concurrente
      const campaignResult = await client.query(
        `SELECT id, creator_id, title, status, end_date, min_investment, goal_amount, current_amount FROM campaigns WHERE id = $1 FOR UPDATE`,
        [dto.campaignId]
      );

      if (campaignResult.rows.length === 0) {
        throw new BadRequestException('La campaña especificada no existe.');
      }

      const campaign = campaignResult.rows[0];
      if (campaign.status !== 'published' && campaign.status !== 'funded') {
        throw new BadRequestException('La campaña no está activa o no acepta inversiones actualmente.');
      }

      if (campaign.end_date && new Date(campaign.end_date) < new Date()) {
        throw new BadRequestException('La fecha límite de la campaña ya ha expirado.');
      }

      const minInvestment = Number(campaign.min_investment) || 0;
      if (dto.amount < minInvestment) {
        throw new BadRequestException(`El monto de inversión ($${dto.amount}) es menor al mínimo requerido por la campaña ($${minInvestment}).`);
      }

      const goalAmount = Number(campaign.goal_amount) || 0;
      const currentAmount = Number(campaign.current_amount) || 0;
      
      const newCurrentAmount = currentAmount + dto.amount;
      const isFunded = newCurrentAmount >= goalAmount;
      const newStatus = isFunded && campaign.status === 'published' ? 'funded' : campaign.status;

      // 4. Validar reward tier si fue seleccionado
      let rewardTierId: string | null = null;
      if (dto.rewardTierId) {
        const tierResult = await client.query(
          `SELECT id, amount, max_claims, current_claims
           FROM reward_tiers
           WHERE id = $1 AND campaign_id = $2 AND is_active = true
           FOR UPDATE`,
          [dto.rewardTierId, dto.campaignId]
        );

        if (tierResult.rows.length === 0) {
          throw new BadRequestException('El nivel de recompensa seleccionado no existe o no pertenece a esta campaña.');
        }

        const tier = tierResult.rows[0];
        const tierAmount = Number(tier.amount);
        const tierMaxClaims = tier.max_claims ? Number(tier.max_claims) : null;
        const tierCurrentClaims = Number(tier.current_claims) || 0;

        // Validar monto mínimo del tier
        if (dto.amount < tierAmount) {
          throw new BadRequestException(
            `El monto de inversión ($${dto.amount}) es menor al mínimo requerido por la recompensa ($${tierAmount}).`
          );
        }

        // Validar disponibilidad de claims
        if (tierMaxClaims !== null && tierCurrentClaims >= tierMaxClaims) {
          throw new BadRequestException('Esta recompensa ha alcanzado su límite máximo de reclamaciones.');
        }

        // Incrementar current_claims
        await client.query(
          `UPDATE reward_tiers SET current_claims = current_claims + 1 WHERE id = $1`,
          [dto.rewardTierId]
        );

        rewardTierId = dto.rewardTierId;
      }

      // 5. Descontar el saldo del inversor (Aumentar lo invertido)
      await client.query(
        `UPDATE investor_profiles 
         SET total_investments = total_investments + 1, 
             total_invested = total_invested + $2 
         WHERE user_id = $1`,
        [userId, dto.amount]
      );

      // 6. Actualizar los totales de la campaña (y estado si se alcanzó la meta)
      let campaignUpdateQuery = `
        UPDATE campaigns 
        SET current_amount = current_amount + $2, 
            investor_count = investor_count + 1 
        WHERE id = $1
      `;

      if (newStatus === 'funded' && campaign.status !== 'funded') {
        campaignUpdateQuery = `
          UPDATE campaigns 
          SET current_amount = current_amount + $2, 
              investor_count = investor_count + 1,
              status = 'funded'
          WHERE id = $1
        `;
      }

      await client.query(campaignUpdateQuery, [dto.campaignId, dto.amount]);

      // Registrar en el historial si cambió de estado a funded
      if (newStatus === 'funded' && campaign.status !== 'funded') {
        await client.query(
          `INSERT INTO campaign_status_history (
            campaign_id, from_status, to_status, changed_by
          ) VALUES (
            $1, $2, $3, $4
          )`,
          [dto.campaignId, campaign.status, newStatus, userId]
        );
      }

      // 7. Insertar el registro final de la inversión marcado como completado
      const insertResult = await client.query(
        `INSERT INTO investments (
          campaign_id, investor_id, amount, reward_tier_id, status
        ) VALUES (
          $1, $2, $3, $4, 'completed'
        ) RETURNING *`,
        [dto.campaignId, userId, dto.amount, rewardTierId]
      );

      const investment = insertResult.rows[0];

      // 8. Insertar registro en el Ledger Financiero (transactions)
      await client.query(
        `INSERT INTO transactions (
          investment_id, transaction_type, amount, status
        ) VALUES (
          $1, 'payment', $2, 'completed'
        )`,
        [investment.id, dto.amount]
      );

      // 9. Registrar Auditoría inmutable (audit_logs)
      await client.query(
        `INSERT INTO audit_logs (
          user_id, action, entity_type, entity_id, new_values
        ) VALUES (
          $1, 'investment_created', 'campaign', $2, $3
        )`,
        [userId, dto.campaignId, JSON.stringify({ amount: dto.amount, investment_id: investment.id })]
      );

      // 10. Crear Notificación para el Emprendedor
      let notificationTypeId: string;
      const typeResult = await client.query(
        `SELECT id FROM notification_types WHERE code = 'investment_received'`
      );
      if (typeResult.rows.length > 0) {
        notificationTypeId = typeResult.rows[0].id;
      } else {
        const insertType = await client.query(
          `INSERT INTO notification_types (code, name, category) VALUES ('investment_received', 'Inversión Recibida', 'investment') RETURNING id`
        );
        notificationTypeId = insertType.rows[0].id;
      }

      await client.query(
        `INSERT INTO notifications (
          user_id, type_id, title, body, reference_type, reference_id
        ) VALUES (
          $1, $2, $3, $4, 'campaign', $5
        )`,
        [
          campaign.creator_id,
          notificationTypeId,
          '¡Nueva inversión recibida!',
          `Un inversor acaba de aportar $${dto.amount} a tu campaña "${campaign.title}".`,
          dto.campaignId
        ]
      );

      const investmentObj = mapRowToInvestment(investment);
      
      return {
        ticket: investmentObj,
        remainingBalance: availableCapital - dto.amount
      };
    });
  }

  /**
   * Obtiene el historial detallado de inversiones de un usuario.
   */
  async getMyInvestments(userId: string): Promise<InvestmentHistoryItem[]> {
    const query = `
      SELECT 
        i.id, 
        i.amount, 
        i.status as investment_status, 
        i.created_at,
        c.id as campaign_id, 
        c.title as campaign_title, 
        c.cover_image_url as campaign_cover_image, 
        c.status as campaign_status,
        rt.title as reward_title
      FROM investments i
      JOIN campaigns c ON i.campaign_id = c.id
      LEFT JOIN reward_tiers rt ON i.reward_tier_id = rt.id
      WHERE i.investor_id = $1
      ORDER BY i.created_at DESC
    `;
    
    const rows = await this.queryMany(query, [userId]);
    return rows.map(mapRowToInvestmentHistoryItem);
  }
}

