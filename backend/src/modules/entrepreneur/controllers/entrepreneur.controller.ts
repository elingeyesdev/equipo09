import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { EntrepreneurService } from '../services';
import {
  CreateEntrepreneurProfileDto,
  UpdateEntrepreneurProfileDto,
  QueryCampaignsDto,
  CreateCampaignDto,
} from '../dto';
import { ApiSuccessResponse, PaginatedResponse } from '../../../common/dto';
import {
  EntrepreneurProfile,
  EntrepreneurCampaign,
  CampaignFinancialProgress,
  EntrepreneurFinancialSummary,
  CampaignCreationReadiness,
} from '../models';

@ApiTags('entrepreneur-profile')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('entrepreneurs')
export class EntrepreneurController {
  constructor(private readonly entrepreneurService: EntrepreneurService) { }

  @Post('me/profile')
  @ApiOperation({ summary: 'Crear perfil de emprendedor (EDT 1.1)' })
  @ApiResponse({ status: 201, description: 'Perfil creado exitosamente.' })
  @ApiResponse({ status: 409, description: 'El usuario ya tiene un perfil.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async createProfile(
    @Req() req: Request,
    @Body() dto: CreateEntrepreneurProfileDto,
  ): Promise<ApiSuccessResponse<EntrepreneurProfile>> {
    const userId = (req as any).user.id;
    const profile = await this.entrepreneurService.createProfile(userId, dto);
    return new ApiSuccessResponse(profile, 'Perfil creado exitosamente');
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Obtener mi perfil de emprendedor' })
  @ApiResponse({ status: 200, description: 'Perfil retornado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado.' })
  async getMyProfile(
    @Req() req: Request,
  ): Promise<ApiSuccessResponse<EntrepreneurProfile>> {
    const userId = (req as any).user.id;
    const profile = await this.entrepreneurService.getMyProfile(userId);
    return new ApiSuccessResponse(profile);
  }

  @Get('me/profile/campaign-readiness')
  @ApiOperation({
    summary: 'Comprobar si el perfil permite crear campañas',
  })
  @ApiResponse({ status: 200, description: 'Estado de requisitos para nuevas campañas.' })
  async getCampaignReadiness(
    @Req() req: Request,
  ): Promise<ApiSuccessResponse<CampaignCreationReadiness>> {
    const userId = (req as any).user.id;
    const readiness =
      await this.entrepreneurService.getCampaignCreationReadiness(userId);
    return new ApiSuccessResponse(readiness);
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Actualizar mi perfil (EDT 1.2)' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente.' })
  async updateMyProfile(
    @Req() req: Request,
    @Body() dto: UpdateEntrepreneurProfileDto,
  ): Promise<ApiSuccessResponse<EntrepreneurProfile>> {
    const userId = (req as any).user.id;
    const profile = await this.entrepreneurService.updateMyProfile(userId, dto);
    return new ApiSuccessResponse(profile, 'Perfil actualizado exitosamente');
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Obtener perfil público de un emprendedor' })
  async getProfileById(
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<EntrepreneurProfile>> {
    const profile = await this.entrepreneurService.getProfileById(id);
    return new ApiSuccessResponse(profile);
  }
  @Post('me/profile/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Subir avatar del emprendedor' })
  async uploadAvatar(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiSuccessResponse<EntrepreneurProfile>> {
    const userId = (req as any).user.id;
    const url = `/uploads/profiles/${file.filename}`;
    const profile = await this.entrepreneurService.updateMyProfile(userId, {
      avatarUrl: url,
    } as any);
    return new ApiSuccessResponse(profile, 'Avatar actualizado');
  }

  @Post('me/profile/cover')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Subir portada del emprendedor' })
  async uploadCover(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiSuccessResponse<EntrepreneurProfile>> {
    const userId = (req as any).user.id;
    const url = `/uploads/profiles/${file.filename}`;
    const profile = await this.entrepreneurService.updateMyProfile(userId, {
      coverUrl: url,
    } as any);
    return new ApiSuccessResponse(profile, 'Portada actualizada');
  }
  @ApiTags('entrepreneur-campaigns')
  @Post('me/campaigns')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva campaña (EDT 1.3)' })
  @ApiResponse({ status: 201, description: 'Campaña creada exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'Perfil incompleto u otros datos inválidos.',
  })
  @ApiResponse({ status: 404, description: 'Sin perfil de emprendedor.' })
  async createCampaign(
    @Req() req: Request,
    @Body() dto: CreateCampaignDto,
  ): Promise<ApiSuccessResponse<EntrepreneurCampaign>> {
    const userId = (req as any).user.id;
    const campaign = await this.entrepreneurService.createCampaign(userId, dto);
    return new ApiSuccessResponse(campaign, 'Campaña creada exitosamente');
  }

  @ApiTags('entrepreneur-campaigns')
  @Get('me/campaigns')
  @ApiOperation({ summary: 'Listar mis campañas (EDT 1.3)' })
  @ApiResponse({ status: 200, description: 'Lista paginada de campañas.' })
  async getMyCampaigns(
    @Req() req: Request,
    @Query() query: QueryCampaignsDto,
  ): Promise<ApiSuccessResponse<PaginatedResponse<EntrepreneurCampaign>>> {
    const userId = (req as any).user.id;
    const result = await this.entrepreneurService.getMyCampaigns(userId, query);
    return new ApiSuccessResponse(result);
  }

  @ApiTags('entrepreneur-campaigns')
  @Post('me/campaigns/:campaignId/submit-for-review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar campaña en borrador a revisión' })
  @ApiResponse({ status: 200, description: 'Estado actualizado.' })
  @ApiResponse({ status: 400, description: 'Transición no permitida.' })
  async submitCampaignForReview(
    @Req() req: Request,
    @Param('campaignId') campaignId: string,
  ): Promise<ApiSuccessResponse<EntrepreneurCampaign>> {
    const userId = (req as any).user.id;
    const campaign = await this.entrepreneurService.submitCampaignForReview(
      userId,
      campaignId,
    );
    return new ApiSuccessResponse(campaign, 'Campaña enviada a revisión');
  }

  @ApiTags('entrepreneur-campaigns')
  @Post('me/campaigns/:campaignId/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publicar campaña (borrador o aprobada)' })
  @ApiResponse({ status: 200, description: 'Campaña publicada.' })
  @ApiResponse({ status: 400, description: 'Transición no permitida.' })
  async publishCampaign(
    @Req() req: Request,
    @Param('campaignId') campaignId: string,
  ): Promise<ApiSuccessResponse<EntrepreneurCampaign>> {
    const userId = (req as any).user.id;
    const campaign = await this.entrepreneurService.publishCampaign(
      userId,
      campaignId,
    );
    return new ApiSuccessResponse(campaign, 'Campaña publicada');
  }

  @ApiTags('entrepreneur-campaigns')
  @Post('me/campaigns/:campaignId/cover')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/campaigns',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Subir portada de una campaña' })
  async uploadCampaignCover(
    @Req() req: Request,
    @Param('campaignId') campaignId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiSuccessResponse<EntrepreneurCampaign>> {
    const userId = (req as any).user.id;
    const url = `/uploads/campaigns/${file.filename}`;
    const campaign = await this.entrepreneurService.updateCampaignCover(
      userId,
      campaignId,
      url,
    );
    return new ApiSuccessResponse(campaign, 'Portada de campaña actualizada');
  }

  @ApiTags('entrepreneur-campaigns')
  @Get('me/campaigns/:campaignId')
  @ApiOperation({ summary: 'Obtener detalle de una campaña propia' })
  async getMyCampaignById(
    @Req() req: Request,
    @Param('campaignId') campaignId: string,
  ): Promise<ApiSuccessResponse<EntrepreneurCampaign>> {
    const userId = (req as any).user.id;
    const campaign = await this.entrepreneurService.getMyCampaignById(
      userId,
      campaignId,
    );
    return new ApiSuccessResponse(campaign);
  }

  @ApiTags('entrepreneur-finances')
  @Get('me/finances/summary')
  @ApiOperation({ summary: 'Obtener resumen financiero global' })
  async getMyFinancialSummary(
    @Req() req: Request,
  ): Promise<ApiSuccessResponse<EntrepreneurFinancialSummary>> {
    const userId = (req as any).user.id;
    const summary = await this.entrepreneurService.getMyFinancialSummary(
      userId,
    );
    return new ApiSuccessResponse(summary);
  }

  @ApiTags('entrepreneur-finances')
  @Get('me/campaigns/:campaignId/financial-progress')
  @ApiOperation({ summary: 'Progreso financiero de una campaña (EDT 1.4)' })
  @ApiResponse({ status: 200, description: 'Progreso financiero retornado.' })
  async getCampaignFinancialProgress(
    @Req() req: Request,
    @Param('campaignId') campaignId: string,
  ): Promise<ApiSuccessResponse<CampaignFinancialProgress>> {
    const userId = (req as any).user.id;
    const progress = await this.entrepreneurService.getCampaignFinancialProgress(
      userId,
      campaignId,
    );
    return new ApiSuccessResponse(progress);
  }
}
