import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/database';
import {
  InvestorProfile,
  mapRowToInvestorProfile,
} from '../models';
import {
  CreateInvestorProfileDto,
  UpdateInvestorProfileDto,
} from '../dto';
import { CapitalOverview } from '../models';

/**
 * Repository: Perfil de Inversor
 * Capa de acceso a datos para investor_profiles.
 * Solo queries SQL — sin lógica de negocio.
 */
@Injectable()
export class InvestorProfileRepository extends BaseRepository {
  /**
   * Busca un perfil por su ID.
   */
  async findById(id: string): Promise<InvestorProfile | null> {
    const row = await this.queryOne(
      `SELECT * FROM investor_profiles WHERE id = $1`,
      [id],
    );
    return row ? mapRowToInvestorProfile(row) : null;
  }

  /**
   * Busca un perfil por el user_id del usuario.
   */
  async findByUserId(userId: string): Promise<InvestorProfile | null> {
    const row = await this.queryOne(
      `SELECT * FROM investor_profiles WHERE user_id = $1`,
      [userId],
    );
    return row ? mapRowToInvestorProfile(row) : null;
  }

  /**
   * Verifica si un usuario ya tiene perfil de inversor.
   */
  async existsByUserId(userId: string): Promise<boolean> {
    const result = await this.queryOne(
      `SELECT 1 FROM investor_profiles WHERE user_id = $1`,
      [userId],
    );
    return result !== null;
  }

  /** Inversiones registradas (bloquea borrar perfil si > 0). */
  async countInvestmentsByInvestor(userId: string): Promise<number> {
    const row = await this.queryOne<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM investments WHERE investor_id = $1`,
      [userId],
    );
    return row ? parseInt(row.c, 10) : 0;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM investor_profiles WHERE user_id = $1`,
      [userId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Crea un nuevo perfil de inversor.
   * También asigna el rol 'investor' al usuario si no lo tiene.
   */
  async create(
    userId: string,
    dto: CreateInvestorProfileDto,
  ): Promise<InvestorProfile> {
    return this.transaction(async (client) => {
      // 1. Insertar perfil
      const result = await client.query(
        `INSERT INTO investor_profiles (
          user_id, first_name, last_name, display_name, bio,
          investor_type, tax_id,
          address_line1, address_line2, city, state, country, postal_code,
          preferred_categories, min_investment, max_investment
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16
        )
        RETURNING *`,
        [
          userId,
          dto.firstName,
          dto.lastName,
          dto.displayName ?? null,
          dto.bio ?? null,
          dto.investorType ?? 'individual',
          dto.taxId ?? null,
          dto.addressLine1 ?? null,
          dto.addressLine2 ?? null,
          dto.city ?? null,
          dto.state ?? null,
          dto.country ?? null,
          dto.postalCode ?? null,
          JSON.stringify(dto.preferredCategories ?? []),
          dto.minInvestment ?? null,
          dto.maxInvestment ?? null,
        ],
      );

      // 2. Asignar rol 'investor' si no existe
      await client.query(
        `INSERT INTO user_roles (user_id, role_id)
         SELECT $1, r.id FROM roles r WHERE r.name = 'investor'
         ON CONFLICT (user_id, role_id) DO NOTHING`,
        [userId],
      );

      return mapRowToInvestorProfile(result.rows[0]);
    });
  }

  /**
   * Actualiza un perfil existente.
   * Solo actualiza los campos que vienen en el DTO (no undefined).
   */
  async update(
    userId: string,
    dto: UpdateInvestorProfileDto,
  ): Promise<InvestorProfile | null> {
    // Construir dinámicamente solo los campos que cambian
    const fieldMap: Record<string, any> = {
      first_name: dto.firstName,
      last_name: dto.lastName,
      display_name: dto.displayName,
      bio: dto.bio,
      investor_type: dto.investorType,
      tax_id: dto.taxId,
      address_line1: dto.addressLine1,
      address_line2: dto.addressLine2,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      postal_code: dto.postalCode,
      preferred_categories: dto.preferredCategories !== undefined
        ? JSON.stringify(dto.preferredCategories)
        : undefined,
      min_investment: dto.minInvestment,
      max_investment: dto.maxInvestment,
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
      `UPDATE investor_profiles
       SET ${setClauses.join(', ')}
       WHERE user_id = $${paramIndex}
       RETURNING *`,
      [...values, userId],
    );

    return row ? mapRowToInvestorProfile(row) : null;
  }

  /**
   * Obtiene el resumen de capital para un inversor.
   * Calcula saldo disponible y métricas de inversión reales combinando las tablas.
   */
  async getCapitalOverview(userId: string): Promise<CapitalOverview | null> {
    const row = await this.queryOne(`
      SELECT 
        ip.total_investments,
        ip.total_invested,
        ip.max_investment,
        (ip.max_investment - ip.total_invested) AS available_capital,
        COUNT(i.id) FILTER (WHERE i.status = 'completed') AS completed_investments,
        SUM(i.amount) FILTER (WHERE i.status = 'pending') AS pending_amount
      FROM investor_profiles ip
      LEFT JOIN investments i ON i.investor_id = ip.user_id
      WHERE ip.user_id = $1
      GROUP BY ip.id
    `, [userId]);

    if (!row) return null;

    return {
      totalInvestments: Number(row.total_investments) || 0,
      totalInvested: Number(row.total_invested) || 0,
      maxInvestmentLimit: row.max_investment ? Number(row.max_investment) : null,
      availableCapital: row.available_capital ? Number(row.available_capital) : null,
      completedInvestments: Number(row.completed_investments) || 0,
      pendingAmount: Number(row.pending_amount) || 0,
    };
  }

  /**
   * Inyecta capital adicional al inversor (aumenta max_investment).
   * Transacción atómica con lock pesimista + registro en capital_transactions.
   */
  async addCapital(
    userId: string,
    amount: number,
    notes?: string,
  ): Promise<{ newMax: number; availableCapital: number }> {
    return this.transaction(async (client) => {
      // 1. Bloquear perfil para escritura (pessimistic lock)
      const result = await client.query(
        `SELECT max_investment, total_invested
         FROM investor_profiles
         WHERE user_id = $1 FOR UPDATE`,
        [userId],
      );

      if (result.rows.length === 0) {
        throw new Error('Perfil de inversor no encontrado');
      }

      const { max_investment, total_invested } = result.rows[0];
      const previousMax = Number(max_investment) || 0;
      const newMax = previousMax + amount;
      const totalInvestedNum = Number(total_invested) || 0;

      // 2. Actualizar max_investment
      await client.query(
        `UPDATE investor_profiles
         SET max_investment = $2
         WHERE user_id = $1`,
        [userId, newMax],
      );

      // 3. Registrar en historial de capital
      await client.query(
        `INSERT INTO capital_transactions (user_id, amount, type, previous_max, new_max, notes)
         VALUES ($1, $2, 'deposit', $3, $4, $5)`,
        [userId, amount, previousMax, newMax, notes ?? null],
      );

      return {
        newMax,
        availableCapital: newMax - totalInvestedNum,
      };
    });
  }

  /**
   * Obtiene el historial de transacciones de capital de un inversor.
   */
  async getCapitalHistory(userId: string, limit = 20): Promise<any[]> {
    const result = await this.query(
      `SELECT id, amount, type, previous_max, new_max, notes, created_at
       FROM capital_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit],
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      amount: Number(row.amount),
      type: row.type,
      previousMax: Number(row.previous_max),
      newMax: Number(row.new_max),
      notes: row.notes,
      createdAt: row.created_at,
    }));
  }
}

