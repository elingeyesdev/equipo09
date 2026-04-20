import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseRepository } from '../../../common/database';
import { Investment, mapRowToInvestment } from '../models/investment.model';
import { InvestmentDto } from '../dto/investment.dto';

@Injectable()
export class InvestmentsRepository extends BaseRepository {
  /**
   * Motor transaccional SQL: Descuenta saldo simulado, actualiza la campaña
   * y registra la inversión utilizando bloqueos pesimistas (FOR UPDATE)
   * para asegurar integridad ACID en condiciones de concurrencia.
   */
  async createInvestmentTransaction(userId: string, dto: InvestmentDto): Promise<Investment> {
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
        `SELECT id, status, end_date FROM campaigns WHERE id = $1 FOR UPDATE`,
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

      // 4. Descontar el saldo del inversor (Aumentar lo invertido)
      await client.query(
        `UPDATE investor_profiles 
         SET total_investments = total_investments + 1, 
             total_invested = total_invested + $2 
         WHERE user_id = $1`,
        [userId, dto.amount]
      );

      // 5. Actualizar los totales de la campaña
      await client.query(
        `UPDATE campaigns 
         SET current_amount = current_amount + $2, 
             investor_count = investor_count + 1 
         WHERE id = $1`,
        [dto.campaignId, dto.amount]
      );

      // 6. Insertar el registro final de la inversión marcado como completado
      const insertResult = await client.query(
        `INSERT INTO investments (
          campaign_id, investor_id, amount, status
        ) VALUES (
          $1, $2, $3, 'completed'
        ) RETURNING *`,
        [dto.campaignId, userId, dto.amount]
      );

      return mapRowToInvestment(insertResult.rows[0]);
    });
  }
}
