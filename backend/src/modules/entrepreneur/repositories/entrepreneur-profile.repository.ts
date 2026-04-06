import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/database';
import {
  EntrepreneurProfile,
  mapRowToEntrepreneurProfile,
} from '../models';
import { CreateEntrepreneurProfileDto, UpdateEntrepreneurProfileDto } from '../dto';

/**
 * Repository: Perfil de Emprendedor
 * Capa de acceso a datos para entrepreneur_profiles.
 * Solo queries SQL — sin lógica de negocio.
 */
@Injectable()
export class EntrepreneurProfileRepository extends BaseRepository {
  /**
   * Busca un perfil por su ID.
   */
  async findById(id: string): Promise<EntrepreneurProfile | null> {
    const row = await this.queryOne(
      `SELECT * FROM entrepreneur_profiles WHERE id = $1`,
      [id],
    );
    return row ? mapRowToEntrepreneurProfile(row) : null;
  }

  /**
   * Busca un perfil por el user_id del usuario.
   */
  async findByUserId(userId: string): Promise<EntrepreneurProfile | null> {
    const row = await this.queryOne(
      `SELECT * FROM entrepreneur_profiles WHERE user_id = $1`,
      [userId],
    );
    return row ? mapRowToEntrepreneurProfile(row) : null;
  }

  /**
   * Busca un perfil por su nombre público (displayName).
   */
  async findByDisplayName(displayName: string): Promise<EntrepreneurProfile | null> {
    const row = await this.queryOne(
      `SELECT * FROM entrepreneur_profiles WHERE LOWER(display_name) = LOWER($1)`,
      [displayName],
    );
    return row ? mapRowToEntrepreneurProfile(row) : null;
  }

  /**
   * Crea un nuevo perfil de emprendedor.
   * También asigna el rol 'entrepreneur' al usuario si no lo tiene.
   */
  async create(
    userId: string,
    dto: CreateEntrepreneurProfileDto,
  ): Promise<EntrepreneurProfile> {
    return this.transaction(async (client) => {
      // 1. Insertar perfil
      const result = await client.query(
        `INSERT INTO entrepreneur_profiles (
          user_id, first_name, last_name, display_name, bio,
          company_name, website, linkedin_url,
          address_line, city, state, country, postal_code,
          bank_account_number, bank_name, avatar_url, cover_url
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14, $15, $16, $17
        )
        RETURNING *`,
        [
          userId,
          dto.firstName,
          dto.lastName,
          dto.displayName ?? null,
          dto.bio ?? null,
          dto.companyName ?? null,
          dto.website ?? null,
          dto.linkedinUrl ?? null,
          dto.addressLine ?? null,
          dto.city ?? null,
          dto.state ?? null,
          dto.country ?? null,
          dto.postalCode ?? null,
          dto.bankAccountNumber ?? null,
          dto.bankName ?? null,
          (dto as any).avatarUrl ?? null,
          (dto as any).coverUrl ?? null,
        ],
      );

      // 2. Asignar rol 'entrepreneur' si no existe
      await client.query(
        `INSERT INTO user_roles (user_id, role_id)
         SELECT $1, r.id FROM roles r WHERE r.name = 'entrepreneur'
         ON CONFLICT (user_id, role_id) DO NOTHING`,
        [userId],
      );

      return mapRowToEntrepreneurProfile(result.rows[0]);
    });
  }

  /**
   * Actualiza un perfil existente.
   * Solo actualiza los campos que vienen en el DTO (no undefined).
   */
  async update(
    userId: string,
    dto: UpdateEntrepreneurProfileDto,
  ): Promise<EntrepreneurProfile | null> {
    // Construir dinámicamente solo los campos que cambian
    const fieldMap: Record<string, any> = {
      first_name: dto.firstName,
      last_name: dto.lastName,
      display_name: dto.displayName,
      bio: dto.bio,
      company_name: dto.companyName,
      website: dto.website,
      linkedin_url: dto.linkedinUrl,
      address_line: dto.addressLine,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      postal_code: dto.postalCode,
      bank_account_number: dto.bankAccountNumber,
      bank_name: dto.bankName,
      avatar_url: (dto as any).avatarUrl,
      cover_url: (dto as any).coverUrl,
    };

    // Filtrar campos undefined
    const entries = Object.entries(fieldMap).filter(
      ([, value]) => value !== undefined,
    );

    if (entries.length === 0) {
      return this.findByUserId(userId);
    }

    const setClauses = entries.map(
      ([key], index) => `${key} = $${index + 1}`,
    );
    const values = entries.map(([, value]) => value);

    const paramIndex = values.length + 1;

    const row = await this.queryOne(
      `UPDATE entrepreneur_profiles
       SET ${setClauses.join(', ')}
       WHERE user_id = $${paramIndex}
       RETURNING *`,
      [...values, userId],
    );

    return row ? mapRowToEntrepreneurProfile(row) : null;
  }

  /**
   * Verifica si un usuario ya tiene perfil de emprendedor.
   */
  async existsByUserId(userId: string): Promise<boolean> {
    const result = await this.queryOne(
      `SELECT 1 FROM entrepreneur_profiles WHERE user_id = $1`,
      [userId],
    );
    return result !== null;
  }

  /**
   * Incrementa el contador de campañas del emprendedor.
   */
  async incrementCampaignCount(userId: string): Promise<void> {
    await this.query(
      `UPDATE entrepreneur_profiles
       SET total_campaigns = total_campaigns + 1
       WHERE user_id = $1`,
      [userId],
    );
  }

  /**
   * Actualiza el total recaudado del emprendedor (recalculando desde campaigns).
   */
  async refreshTotalRaised(userId: string): Promise<void> {
    await this.query(
      `UPDATE entrepreneur_profiles ep
       SET total_raised = COALESCE((
         SELECT SUM(c.current_amount)
         FROM campaigns c
         WHERE c.creator_id = ep.user_id
           AND c.status IN ('published', 'funded', 'completed')
       ), 0)
       WHERE ep.user_id = $1`,
      [userId],
    );
  }
}
