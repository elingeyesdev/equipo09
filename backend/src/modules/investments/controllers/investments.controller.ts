import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { InvestmentsService } from '../services/investments.service';
import { InvestmentDto } from '../dto/investment.dto';
import { ApiSuccessResponse } from '../../../common/dto';
import { Investment } from '../models/investment.model';

@ApiTags('investments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  /**
   * POST /investments
   * Endpoint para registrar intención de inversión y descontar saldos.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Realizar aporte e inversión a un proyecto' })
  @ApiResponse({ status: 201, description: 'Inversión procesada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Saldo insuficiente o datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async createInvestment(
    @Req() req: Request,
    @Body() dto: InvestmentDto,
  ): Promise<ApiSuccessResponse<Investment>> {
    const userId = (req as any).user.id;
    const investment = await this.investmentsService.createInvestment(userId, dto);
    
    return new ApiSuccessResponse(investment, 'Inversión procesada exitosamente.');
  }
}
