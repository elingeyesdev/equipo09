import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { InvestorService } from '../services';
import {
  CreateInvestorProfileDto,
  UpdateInvestorProfileDto,
} from '../dto';
import { ApiSuccessResponse } from '../../../common/dto';
import { InvestorProfile } from '../models';

@ApiTags('investor-profile')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('investors')
export class InvestorController {
  constructor(private readonly investorService: InvestorService) {}

  // =========================================================================
  // CREAR PERFIL
  // =========================================================================

  /**
   * POST /investors/me/profile
   * Registra el perfil de inversor del usuario autenticado.
   * Solo se puede crear una vez por usuario.
   */
  @Post('me/profile')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear perfil de inversor' })
  @ApiResponse({ status: 201, description: 'Perfil creado exitosamente.' })
  @ApiResponse({ status: 409, description: 'El usuario ya tiene un perfil de inversor.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async createProfile(
    @Req() req: Request,
    @Body() dto: CreateInvestorProfileDto,
  ): Promise<ApiSuccessResponse<InvestorProfile>> {
    const userId = (req as any).user.id;
    const profile = await this.investorService.createProfile(userId, dto);
    return new ApiSuccessResponse(profile, 'Perfil de inversor creado exitosamente');
  }

  // =========================================================================
  // OBTENER MI PERFIL
  // =========================================================================

  /**
   * GET /investors/me/profile
   * Devuelve el perfil completo del inversor autenticado.
   */
  @Get('me/profile')
  @ApiOperation({ summary: 'Obtener mi perfil de inversor' })
  @ApiResponse({ status: 200, description: 'Perfil retornado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado.' })
  async getMyProfile(
    @Req() req: Request,
  ): Promise<ApiSuccessResponse<InvestorProfile>> {
    const userId = (req as any).user.id;
    const profile = await this.investorService.getMyProfile(userId);
    return new ApiSuccessResponse(profile);
  }

  // =========================================================================
  // EDITAR DATOS PERSONALES
  // =========================================================================

  /**
   * PUT /investors/me/profile
   * Edita los datos personales del inversor autenticado.
   * Solo se actualizan los campos enviados en el body.
   */
  @Put('me/profile')
  @ApiOperation({ summary: 'Editar datos personales del inversor' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async updateMyProfile(
    @Req() req: Request,
    @Body() dto: UpdateInvestorProfileDto,
  ): Promise<ApiSuccessResponse<InvestorProfile>> {
    const userId = (req as any).user.id;
    const profile = await this.investorService.updateMyProfile(userId, dto);
    return new ApiSuccessResponse(profile, 'Perfil actualizado exitosamente');
  }

  // =========================================================================
  // VER PERFIL PÚBLICO
  // =========================================================================

  /**
   * GET /investors/:id/profile
   * Vista pública del perfil de un inversor (por su profile ID).
   */
  @Get(':id/profile')
  @ApiOperation({ summary: 'Obtener perfil público de un inversor' })
  @ApiResponse({ status: 200, description: 'Perfil retornado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado.' })
  async getProfileById(
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<InvestorProfile>> {
    const profile = await this.investorService.getProfileById(id);
    return new ApiSuccessResponse(profile);
  }
}
