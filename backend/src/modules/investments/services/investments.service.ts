import { Injectable } from '@nestjs/common';
import { InvestmentsRepository } from '../repositories/investments.repository';
import { InvestmentDto } from '../dto/investment.dto';
import { InvestmentResult, InvestmentHistoryItem } from '../models/investment.model';

@Injectable()
export class InvestmentsService {
  constructor(private readonly investmentsRepository: InvestmentsRepository) {}

  /**
   * Crea una nueva inversión utilizando el motor transaccional SQL
   */
  async createInvestment(userId: string, dto: InvestmentDto): Promise<InvestmentResult> {
    return this.investmentsRepository.createInvestmentTransaction(userId, dto);
  }

  /**
   * Obtiene el historial de inversiones de un usuario
   */
  async getMyInvestments(userId: string): Promise<InvestmentHistoryItem[]> {
    return this.investmentsRepository.getInvestmentsByUserId(userId, 50, 0);
  }
}
