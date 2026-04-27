import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseRepository } from '../../../common/database';
import { Investment, InvestmentResult, mapRowToInvestment } from '../models/investment.model';
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
        `SELECT id, status, end_date, min_investment, goal_amount, current_amount, campaign_type FROM campaigns WHERE id = $1 FOR UPDATE`,
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
      const remainingAmount = goalAmount - currentAmount;
      
      if (dto.amount > remainingAmount) {
        throw new BadRequestException(`El monto de inversión ($${dto.amount}) supera el saldo restante de la campaña ($${remainingAmount}).`);
      }
      
      const newCurrentAmount = currentAmount + dto.amount;
      const isFunded = newCurrentAmount >= goalAmount;
      const newStatus = isFunded && campaign.status === 'published' ? 'funded' : campaign.status;

      // 4. Validar reward tier si fue seleccionado o requerido
      let rewardTierId: string | null = null;
      if (campaign.campaign_type === 'reward' && !dto.rewardTierId) {
        throw new BadRequestException('Para campañas de tipo recompensa, es obligatorio seleccionar un nivel de recompensa.');
      }

      if (dto.rewardTierId) {
        // REGLA: Solo campañas tipo 'reward' permiten recompensas
        if (campaign.campaign_type !== 'reward') {
          throw new BadRequestException('Esta campaña no admite niveles de recompensa.');
        }

        const tierResult = await client.query(
          `SELECT id, amount, max_claims, current_claims, is_active 
           FROM reward_tiers 
           WHERE id = $1 AND campaign_id = $2
           FOR UPDATE`,
          [dto.rewardTierId, dto.campaignId]
        );

        if (tierResult.rows.length === 0) {
          throw new BadRequestException('La recompensa no existe o no pertenece a esta campaña.');
        }

        const tier = tierResult.rows[0];

        if (!tier.is_active) {
          throw new BadRequestException('La recompensa seleccionada no está activa.');
        }

        // REGLA: Validar monto EXACTO
        const tierAmount = Number(tier.amount);
        if (dto.amount !== tierAmount) {
          throw new BadRequestException(
            `El monto de inversión ($${dto.amount}) debe ser exactamente igual al valor de la recompensa ($${tierAmount}).`
          );
        }

        // REGLA: Validar stock (atómico via FOR UPDATE + check)
        const tierMaxClaims = tier.max_claims !== null ? Number(tier.max_claims) : null;
        const tierCurrentClaims = Number(tier.current_claims);

        if (tierMaxClaims !== null && tierCurrentClaims >= tierMaxClaims) {
          throw new BadRequestException('Esta recompensa está agotada (Sold Out).');
        }

        // Incrementar reclamos de forma atómica
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

      // 6. Actualizar los totales de la campaña
      const campaignUpdateQuery = newStatus === 'funded' && campaign.status !== 'funded'
        ? `UPDATE campaigns 
           SET current_amount = current_amount + $2, 
               investor_count = investor_count + 1,
               status = 'funded'
           WHERE id = $1`
        : `UPDATE campaigns 
           SET current_amount = current_amount + $2, 
               investor_count = investor_count + 1 
           WHERE id = $1`;

      await client.query(campaignUpdateQuery, [dto.campaignId, dto.amount]);

      // 7. Insertar el registro de la inversión marcado como completado
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

      // 9. Crear el registro en reward_claims si corresponde
      if (rewardTierId) {
        await client.query(
          `INSERT INTO reward_claims (investment_id, status) VALUES ($1, 'pending')`,
          [investment.id]
        );
      }

      const investmentObj = mapRowToInvestment(investment);
      
      return {
        ticket: investmentObj,
        remainingBalance: availableCapital - dto.amount
      };
    });
  }

  /**
   * Obtiene el historial de inversiones de un inversor con información de campaña y recompensa
   */
  async getInvestmentsByUserId(userId: string, limit: number, offset: number): Promise<any[]> {
    const result = await this.query(
      `SELECT 
         i.id,
         i.campaign_id,
         i.amount,
         i.currency,
         i.status,
         i.reward_tier_id,
         i.created_at,
         c.title AS campaign_title,
         c.campaign_type,
         c.cover_image_url AS campaign_cover,
         c.status AS campaign_status,
         rt.title AS reward_title,
         rt.description AS reward_description
       FROM investments i
       JOIN campaigns c ON c.id = i.campaign_id
       LEFT JOIN reward_tiers rt ON rt.id = i.reward_tier_id
       WHERE i.investor_id = $1
       ORDER BY i.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      amount: Number(row.amount),
      investmentStatus: row.status,
      createdAt: row.created_at,
      campaignId: row.campaign_id,
      campaignTitle: row.campaign_title,
      campaignCoverImage: row.campaign_cover,
      campaignStatus: row.campaign_status,
      rewardTitle: row.reward_title,
    }));
  }
}
