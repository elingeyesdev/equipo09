import { Injectable } from '@nestjs/common';
import { InvestmentsRepository } from '../repositories/investments.repository';
import { InvestmentDto } from '../dto/investment.dto';
import { InvestmentResult } from '../models/investment.model';

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
   * Obtiene el historial de inversiones de un inversor con información de campaña
   */
  async getMyInvestments(userId: string, limit: number, offset: number): Promise<any[]> {
    return this.investmentsRepository.getInvestmentsByUserId(userId, limit, offset);
  }
}

