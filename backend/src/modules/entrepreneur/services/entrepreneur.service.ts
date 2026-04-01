import { Injectable, Logger } from '@nestjs/common';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '../../../common/exceptions';
import { PaginatedResponse } from '../../../common/dto';
import {
  EntrepreneurProfileRepository,
  EntrepreneurCampaignRepository,
} from '../repositories';
import {
  CreateEntrepreneurProfileDto,
  UpdateEntrepreneurProfileDto,
  QueryCampaignsDto,
  CreateCampaignDto,
} from '../dto';
import {
  EntrepreneurProfile,
  EntrepreneurCampaign,
  CampaignFinancialProgress,
  EntrepreneurFinancialSummary,
} from '../models';

/**
 * Service: Emprendedor
 * Lógica de negocio para EDT 1.1 → 1.4.
 * Orquesta repositorios y aplica reglas de negocio.
 */
@Injectable()
export class EntrepreneurService {
  private readonly logger = new Logger(EntrepreneurService.name);

  constructor(
    private readonly profileRepo: EntrepreneurProfileRepository,
    private readonly campaignRepo: EntrepreneurCampaignRepository,
  ) {}

  // =========================================================================
  // EDT 1.1 / 1.2 — PERFIL DE EMPRENDEDOR
  // =========================================================================

  /**
   * Crea un perfil de emprendedor para el usuario autenticado.
   * Reglas:
   *  - Un usuario solo puede tener UN perfil de emprendedor.
   *  - Se asigna automáticamente el rol 'entrepreneur'.
   */
  async createProfile(
    userId: string,
    dto: CreateEntrepreneurProfileDto,
  ): Promise<EntrepreneurProfile> {
    this.logger.log(`Creando perfil de emprendedor para user ${userId}`);

    // Verificar que no exista ya
    const exists = await this.profileRepo.existsByUserId(userId);
    if (exists) {
      throw new ConflictException(
        'Este usuario ya tiene un perfil de emprendedor',
      );
    }

    const profile = await this.profileRepo.create(userId, dto);
    this.logger.log(`Perfil creado: ${profile.id} para user ${userId}`);
    return profile;
  }

  /**
   * Obtiene el perfil del emprendedor autenticado.
   */
  async getMyProfile(userId: string): Promise<EntrepreneurProfile> {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil de emprendedor');
    }
    return profile;
  }

  /**
   * Obtiene un perfil de emprendedor por su ID (vista pública).
   */
  async getProfileById(profileId: string): Promise<EntrepreneurProfile> {
    const profile = await this.profileRepo.findById(profileId);
    if (!profile) {
      throw new NotFoundException('Perfil de emprendedor', profileId);
    }
    return profile;
  }

  /**
   * Actualiza el perfil del emprendedor autenticado.
   * Regla: Solo el dueño del perfil puede editarlo.
   */
  async updateMyProfile(
    userId: string,
    dto: UpdateEntrepreneurProfileDto,
  ): Promise<EntrepreneurProfile> {
    this.logger.log(`Actualizando perfil de emprendedor para user ${userId}`);

    // Verificar que el perfil exista
    const exists = await this.profileRepo.existsByUserId(userId);
    if (!exists) {
      throw new NotFoundException('Perfil de emprendedor');
    }

    const updated = await this.profileRepo.update(userId, dto);
    if (!updated) {
      throw new NotFoundException('Perfil de emprendedor');
    }

    this.logger.log(`Perfil actualizado: ${updated.id}`);
    return updated;
  }

  /**
   * Actualiza un perfil verificando que el solicitante sea el dueño.
   * Usado cuando se recibe un profileId desde la URL.
   */
  async updateProfile(
    profileId: string,
    requestingUserId: string,
    dto: UpdateEntrepreneurProfileDto,
  ): Promise<EntrepreneurProfile> {
    // Verificar que el perfil existe
    const profile = await this.profileRepo.findById(profileId);
    if (!profile) {
      throw new NotFoundException('Perfil de emprendedor', profileId);
    }

    // Verificar ownership
    if (profile.userId !== requestingUserId) {
      throw new ForbiddenException(
        'Solo puedes editar tu propio perfil de emprendedor',
      );
    }

    const updated = await this.profileRepo.update(profile.userId, dto);
    if (!updated) {
      throw new NotFoundException('Perfil de emprendedor');
    }

    return updated;
  }

  // =========================================================================
  // EDT 1.3 — CAMPAÑAS DEL EMPRENDEDOR
  // =========================================================================

  /**
   * Lista las campañas del emprendedor con filtros y paginación.
   * Regla: Solo muestra campañas propias del usuario autenticado.
   */
  async getMyCampaigns(
    userId: string,
    query: QueryCampaignsDto,
  ): Promise<PaginatedResponse<EntrepreneurCampaign>> {
    // Verificar que tiene perfil de emprendedor
    await this.ensureEntrepreneurProfile(userId);

    const { campaigns, total } = await this.campaignRepo.findByCreatorId(
      userId,
      query,
    );

    return new PaginatedResponse(campaigns, total, query.page, query.limit);
  }

  /**
   * Crea una nueva campaña para el emprendedor autenticado.
   */
  async createCampaign(
    userId: string,
    dto: CreateCampaignDto,
  ): Promise<EntrepreneurCampaign> {
    // Verificar que tiene perfil de emprendedor
    await this.ensureEntrepreneurProfile(userId);

    this.logger.log(`Creando nueva campaña para user ${userId}: ${dto.title}`);
    const campaign = await this.campaignRepo.create(userId, dto);
    this.logger.log(`Campaña creada: ${campaign.id}`);
    
    return campaign;
  }

  /**
   * Obtiene el detalle de una campaña específica del emprendedor.
   * Regla: Verifica que la campaña pertenezca al usuario.
   */
  async getMyCampaignById(
    userId: string,
    campaignId: string,
  ): Promise<EntrepreneurCampaign> {
    const campaign = await this.campaignRepo.findOneByCreatorId(
      campaignId,
      userId,
    );

    if (!campaign) {
      throw new NotFoundException('Campaña', campaignId);
    }

    return campaign;
  }

  // =========================================================================
  // EDT 1.4 — SEGUIMIENTO FINANCIERO
  // =========================================================================

  /**
   * Obtiene el progreso financiero detallado de una campaña.
   * Incluye: monto recaudado, porcentaje, inversiones por estado,
   *          inversiones recientes, promedios.
   * Regla: Solo el creador de la campaña puede ver esta información.
   */
  async getCampaignFinancialProgress(
    userId: string,
    campaignId: string,
  ): Promise<CampaignFinancialProgress> {
    const progress = await this.campaignRepo.getFinancialProgress(
      campaignId,
      userId,
    );

    if (!progress) {
      throw new NotFoundException('Campaña', campaignId);
    }

    return progress;
  }

  /**
   * Obtiene el resumen financiero global de todas las campañas del emprendedor.
   * Datos agregados para el dashboard principal.
   */
  async getMyFinancialSummary(
    userId: string,
  ): Promise<EntrepreneurFinancialSummary> {
    await this.ensureEntrepreneurProfile(userId);
    return this.campaignRepo.getFinancialSummary(userId);
  }

  // =========================================================================
  // HELPERS PRIVADOS
  // =========================================================================

  /**
   * Verifica que el usuario tenga perfil de emprendedor.
   * Lanza NotFoundException si no existe.
   */
  private async ensureEntrepreneurProfile(userId: string): Promise<void> {
    const exists = await this.profileRepo.existsByUserId(userId);
    if (!exists) {
      throw new NotFoundException(
        'Perfil de emprendedor. Debes crear tu perfil antes de gestionar campañas',
      );
    }
  }
}
