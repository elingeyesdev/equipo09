import { Injectable, Logger } from '@nestjs/common';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '../../../common/exceptions';
import { PaginatedResponse } from '../../../common/dto';
import {
  EntrepreneurProfileRepository,
  EntrepreneurCampaignRepository,
} from '../repositories';
import { UserRepository } from '../../users/repositories';
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
  CampaignCreationReadiness,
  CampaignInvestor,
} from '../models';
import { getCampaignCreationBlockers } from '../utils/campaign-profile-eligibility';

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
    private readonly userRepo: UserRepository,
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

    // Verificar unicidad de displayName
    if (dto.displayName) {
      const existing = await this.profileRepo.findByDisplayName(dto.displayName);
      if (existing) {
        throw new ConflictException(
          `El nombre público "${dto.displayName}" ya está en uso por otro emprendedor`,
        );
      }
    }

    const profile = await this.profileRepo.create(userId, dto);
    this.logger.log(`Perfil creado: ${profile.id} para user ${userId}`);

    try {
      await this.userRepo.assignRoleByName(userId, 'entrepreneur');
      this.logger.log(`Rol entrepreneur sincronizado en user_roles: ${userId}`);
    } catch (err) {
      this.logger.warn(
        `No se pudo asignar rol entrepreneur (¿seed de roles?): ${err}`,
      );
    }

    return profile;
  }

  /**
   * Elimina el perfil de emprendedor y el rol asociado.
   * No elimina la cuenta de usuario ni campañas existentes (bloqueado si hay campañas).
   */
  async deleteMyProfile(userId: string): Promise<void> {
    const n = await this.profileRepo.countCampaignsAsCreator(userId);
    if (n > 0) {
      throw new BadRequestException(
        `No puedes eliminar tu perfil de emprendedor mientras tengas ${n} campaña(s) registrada(s).`,
      );
    }
    const existed = await this.profileRepo.existsByUserId(userId);
    if (!existed) {
      throw new NotFoundException('Perfil de emprendedor');
    }
    await this.profileRepo.deleteByUserId(userId);
    try {
      await this.userRepo.removeRoleByName(userId, 'entrepreneur');
    } catch (err) {
      this.logger.warn(`No se pudo quitar rol entrepreneur: ${err}`);
    }
    this.logger.log(`Perfil de emprendedor eliminado para user ${userId}`);
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
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil de emprendedor');
    }

    // Verificar unicidad de displayName si cambió
    if (dto.displayName) {
      const existing = await this.profileRepo.findByDisplayName(dto.displayName);
      if (existing && existing.userId !== userId) {
        throw new ConflictException(
          `El nombre público "${dto.displayName}" ya está en uso por otro emprendedor`,
        );
      }
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
    await this.ensureProfileCompleteForNewCampaign(userId);

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

  /**
   * Envía una campaña en borrador a revisión (moderación).
   */
  async submitCampaignForReview(
    userId: string,
    campaignId: string,
  ): Promise<EntrepreneurCampaign> {
    await this.ensureEntrepreneurProfile(userId);
    const updated = await this.campaignRepo.submitForReview(campaignId, userId);
    if (!updated) {
      throw new BadRequestException(
        'Solo las campañas en borrador pueden enviarse a revisión',
      );
    }
    return updated;
  }

  /**
   * Publica la campaña (borrador o aprobada → publicada).
   */
  async publishCampaign(
    userId: string,
    campaignId: string,
  ): Promise<EntrepreneurCampaign> {
    await this.ensureEntrepreneurProfile(userId);
    const updated = await this.campaignRepo.publishCampaign(campaignId, userId);
    if (!updated) {
      throw new BadRequestException(
        'No se puede publicar: la campaña debe estar en borrador o aprobada',
      );
    }
    return updated;
  }

  /**
   * Actualiza la imagen de portada de una campaña.
   */
  async updateCampaignCover(
    userId: string,
    campaignId: string,
    coverUrl: string,
  ): Promise<EntrepreneurCampaign> {
    await this.ensureEntrepreneurProfile(userId);
    const updated = await this.campaignRepo.updateCoverImageUrl(
      campaignId,
      userId,
      coverUrl,
    );
    if (!updated) {
      throw new NotFoundException('Campaña', campaignId);
    }
    return updated;
  }

  /**
   * Actualiza una campaña existente.
   * Regla: Solo se permite editar si está en 'draft' o 'rejected'.
   */
  async updateCampaign(
    userId: string,
    campaignId: string,
    dto: Partial<CreateCampaignDto>,
  ): Promise<EntrepreneurCampaign> {
    await this.ensureEntrepreneurProfile(userId);
    
    const campaign = await this.campaignRepo.findOneByCreatorId(campaignId, userId);
    if (!campaign) {
      throw new NotFoundException('Campaña', campaignId);
    }

    if (campaign.status !== 'draft' && campaign.status !== 'rejected') {
      throw new BadRequestException(
        `No se puede editar una campaña en estado ${campaign.status}. Debe estar en borrador o rechazada.`,
      );
    }

    const updated = await this.campaignRepo.update(campaignId, userId, dto);
    if (!updated) {
      throw new NotFoundException('Campaña', campaignId);
    }

    return updated;
  }

  async getCampaignHistory(userId: string, campaignId: string) {
    const campaign = await this.campaignRepo.findOneByCreatorId(
      campaignId,
      userId,
    );
    if (!campaign) {
      throw new NotFoundException('Campaña', campaignId);
    }
    return this.campaignRepo.getHistory(campaignId);
  }

  /**
   * Indica si el perfil cumple los requisitos para crear campañas (sin lanzar).
   */
  async getCampaignCreationReadiness(
    userId: string,
  ): Promise<CampaignCreationReadiness> {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      return {
        canCreateCampaigns: false,
        missingRequirements: [
          'crear tu perfil de emprendedor y completar los datos obligatorios',
        ],
      };
    }
    const missing = getCampaignCreationBlockers(profile);
    return {
      canCreateCampaigns: missing.length === 0,
      missingRequirements: missing,
    };
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
   * Obtiene la lista de inversores para una campaña específica.
   * Regla: Solo el creador de la campaña puede ver sus inversores.
   */
  async getCampaignInvestors(
    userId: string,
    campaignId: string,
    query: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<CampaignInvestor>> {
    await this.ensureEntrepreneurProfile(userId);
    const { investors, total } = await this.campaignRepo.getCampaignInvestors(
      campaignId,
      userId,
      query,
    );

    return new PaginatedResponse(
      investors,
      total,
      query.page || 1,
      query.limit || 20,
    );
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

  /**
   * Perfil existente y completo según reglas de negocio para nuevas campañas.
   */
  private async ensureProfileCompleteForNewCampaign(
    userId: string,
  ): Promise<void> {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException(
        'Perfil de emprendedor. Debes crear tu perfil antes de crear campañas',
      );
    }
    const missing = getCampaignCreationBlockers(profile);
    if (missing.length > 0) {
      throw new BadRequestException(
        `Completa tu perfil para crear campañas. Falta: ${missing.join(', ')}.`,
      );
    }
  }
}
