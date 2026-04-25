import { Controller, Post, Get, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../../auth/guards';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

import { InvestmentsService } from '../services/investments.service';
import { InvestmentDto } from '../dto/investment.dto';
import { ApiSuccessResponse } from '../../../common/dto';
import { InvestmentResult, InvestmentHistoryItem } from '../models/investment.model';

@ApiTags('investments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  /**
   * POST /investments
   * Endpoint para registrar intención de inversión y descontar saldos.
   */
  @Post()
  @Roles('investor')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Realizar aporte e inversión a un proyecto' })
  @ApiResponse({ status: 201, description: 'Inversión procesada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Saldo insuficiente o datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async createInvestment(
    @Req() req: Request,
    @Body() dto: InvestmentDto,
  ): Promise<ApiSuccessResponse<InvestmentResult>> {
    const userId = (req as any).user.id;
    const result = await this.investmentsService.createInvestment(userId, dto);
    
    return new ApiSuccessResponse(result, 'Inversión procesada exitosamente.');
  }

  /**
   * GET /investments/me
   * Endpoint para listar el historial de inversiones del usuario.
   */
  @Get('me')
  @Roles('investor')
  @ApiOperation({ summary: 'Obtener historial de inversiones del usuario' })
  @ApiResponse({ status: 200, description: 'Historial obtenido exitosamente.' })
  async getMyInvestments(
    @Req() req: Request,
  ): Promise<ApiSuccessResponse<InvestmentHistoryItem[]>> {
    const userId = (req as any).user.id;
    const history = await this.investmentsService.getMyInvestments(userId);
    
    return new ApiSuccessResponse(history, 'Historial de inversiones recuperado.');
  }
}
