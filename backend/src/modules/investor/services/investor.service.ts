import { Injectable, Logger } from '@nestjs/common';
import {
  NotFoundException,
  ConflictException,
} from '../../../common/exceptions';
import { InvestorProfileRepository } from '../repositories';
import {
  CreateInvestorProfileDto,
  UpdateInvestorProfileDto,
} from '../dto';
import { InvestorProfile, CapitalOverview } from '../models';

/**
 * Service: Inversor
 * Lógica de negocio para el perfil de inversor.
 * Orquesta repositorios y aplica reglas de negocio.
 */
@Injectable()
export class InvestorService {
  private readonly logger = new Logger(InvestorService.name);

  constructor(
    private readonly profileRepo: InvestorProfileRepository,
  ) {}

  // =========================================================================
  // PERFIL DE INVERSOR — Crear
  // =========================================================================

  /**
   * Crea un perfil de inversor para el usuario autenticado.
   * Reglas:
   *  - Un usuario solo puede tener UN perfil de inversor.
   *  - Se asigna automáticamente el rol 'investor'.
   */
  async createProfile(
    userId: string,
    dto: CreateInvestorProfileDto,
  ): Promise<InvestorProfile> {
    this.logger.log(`Creando perfil de inversor para user ${userId}`);

    const exists = await this.profileRepo.existsByUserId(userId);
    if (exists) {
      throw new ConflictException(
        'Este usuario ya tiene un perfil de inversor',
      );
    }

    const profile = await this.profileRepo.create(userId, dto);
    this.logger.log(`Perfil de inversor creado: ${profile.id} para user ${userId}`);
    return profile;
  }

  // =========================================================================
  // PERFIL DE INVERSOR — Consultar
  // =========================================================================

  /**
   * Obtiene el perfil del inversor autenticado.
   */
  async getMyProfile(userId: string): Promise<InvestorProfile> {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil de inversor');
    }
    return profile;
  }

  /**
   * Obtiene un perfil de inversor por su ID (vista pública).
   */
  async getProfileById(profileId: string): Promise<InvestorProfile> {
    const profile = await this.profileRepo.findById(profileId);
    if (!profile) {
      throw new NotFoundException('Perfil de inversor', profileId);
    }
    return profile;
  }

  // =========================================================================
  // PERFIL DE INVERSOR — Capital y Métricas
  // =========================================================================
  
  /**
   * Obtiene el resumen de capital y métricas de inversión.
   */
  async getCapitalOverview(userId: string): Promise<CapitalOverview> {
    const overview = await this.profileRepo.getCapitalOverview(userId);
    if (!overview) {
      throw new NotFoundException('Perfil de inversor no encontrado');
    }
    return overview;
  }

  // =========================================================================
  // PERFIL DE INVERSOR — Editar
  // =========================================================================

  /**
   * Actualiza los datos personales del inversor autenticado.
   * Regla: Solo el dueño del perfil puede editarlo.
   * Solo actualiza los campos enviados en el body (patch parcial).
   */
  async updateMyProfile(
    userId: string,
    dto: UpdateInvestorProfileDto,
  ): Promise<InvestorProfile> {
    this.logger.log(`Actualizando perfil de inversor para user ${userId}`);

    const exists = await this.profileRepo.existsByUserId(userId);
    if (!exists) {
      throw new NotFoundException('Perfil de inversor');
    }

    const updated = await this.profileRepo.update(userId, dto);
    if (!updated) {
      throw new NotFoundException('Perfil de inversor');
    }

    this.logger.log(`Perfil de inversor actualizado: ${updated.id}`);
    return updated;
  }
}
