import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/database';
import { User, mapRowToUser } from '../models';
import { CreateUserDto } from '../dto';
import * as bcrypt from 'bcrypt';

/**
 * Repository: Usuarios
 * Capa de acceso a datos para la tabla `users`.
 * Solo queries SQL — sin lógica de negocio.
 */
@Injectable()
export class UserRepository extends BaseRepository {
  /**
   * Crea un nuevo usuario con password hasheado.
   */
  async create(dto: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const row = await this.queryOne(
      `INSERT INTO users (email, password_hash, phone, preferred_language)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        dto.email.toLowerCase().trim(),
        passwordHash,
        dto.phone ?? null,
        dto.preferredLanguage ?? 'es',
      ],
    );

    return mapRowToUser(row!);
  }

  /**
   * Asigna un rol por nombre (entrepreneur | investor | admin). Idempotente.
   */
  async assignRoleByName(userId: string, roleName: string): Promise<void> {
    const role = await this.queryOne<{ id: string }>(
      `SELECT id FROM roles WHERE name = $1`,
      [roleName],
    );
    if (!role) {
      throw new Error(`Rol no encontrado en catálogo: ${roleName}`);
    }
    await this.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)
       ON CONFLICT (user_id, role_id) DO NOTHING`,
      [userId, role.id],
    );
  }

  /**
   * Quita un rol por nombre (p. ej. al eliminar solo el perfil emprendedor/inversor).
   */
  async removeRoleByName(userId: string, roleName: string): Promise<void> {
    await this.query(
      `DELETE FROM user_roles ur
       USING roles r
       WHERE ur.user_id = $1 AND ur.role_id = r.id AND r.name = $2`,
      [userId, roleName],
    );
  }

  async hasEntrepreneurProfile(userId: string): Promise<boolean> {
    const row = await this.queryOne(
      `SELECT 1 FROM entrepreneur_profiles WHERE user_id = $1`,
      [userId],
    );
    return row !== null;
  }

  async hasInvestorProfile(userId: string): Promise<boolean> {
    const row = await this.queryOne(
      `SELECT 1 FROM investor_profiles WHERE user_id = $1`,
      [userId],
    );
    return row !== null;
  }

  /**
   * Busca un usuario por ID.
   */
  async findById(id: string): Promise<User | null> {
    const row = await this.queryOne(
      `SELECT u.*, a.access_level as admin_access_level
       FROM users u
       LEFT JOIN admin_profiles a ON a.user_id = u.id
       WHERE u.id = $1`,
      [id],
    );
    return row ? mapRowToUser(row) : null;
  }

  /**
   * Busca un usuario por email (case-insensitive).
   */
  async findByEmail(email: string): Promise<User | null> {
    const row = await this.queryOne(
      `SELECT * FROM users WHERE LOWER(email) = LOWER($1)`,
      [email],
    );
    return row ? mapRowToUser(row) : null;
  }

  /**
   * Busca un usuario por email e incluye el password_hash.
   * Solo para uso interno en AuthService.
   */
  async findByEmailWithPassword(
    email: string,
  ): Promise<{ user: User; passwordHash: string } | null> {
    const row = await this.queryOne(
      `SELECT u.*, a.access_level as admin_access_level 
       FROM users u 
       LEFT JOIN admin_profiles a ON a.user_id = u.id 
       WHERE LOWER(u.email) = LOWER($1) AND u.is_active = true`,
      [email],
    );
    if (!row) return null;
    return {
      user: mapRowToUser(row),
      passwordHash: row.password_hash as string,
    };
  }

  /**
   * Verifica si ya existe un usuario con ese email.
   */
  async existsByEmail(email: string): Promise<boolean> {
    const row = await this.queryOne(
      `SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)`,
      [email],
    );
    return row !== null;
  }

  /**
   * Busca un usuario con sus roles asignados.
   */
  async findByIdWithRoles(id: string): Promise<User | null> {
    const row = await this.queryOne(
      `SELECT u.*,
              COALESCE(
                ARRAY_AGG(r.name) FILTER (WHERE r.name IS NOT NULL),
                ARRAY[]::VARCHAR[]
              ) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r       ON r.id = ur.role_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id],
    );
    return row ? mapRowToUser(row) : null;
  }

  /**
   * Actualiza la fecha de último login.
   */
  async updateLastLogin(userId: string, ip?: string): Promise<void> {
    await this.query(
      `UPDATE users
       SET last_login_at = NOW(), last_login_ip = $2, failed_login_attempts = 0
       WHERE id = $1`,
      [userId, ip ?? null],
    );
  }

  /**
   * Incrementa el contador de intentos fallidos de login.
   */
  async incrementFailedAttempts(userId: string): Promise<void> {
    await this.query(
      `UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1`,
      [userId],
    );
  }

  /**
   * TEMPORAL: Crea o actualiza el usuario superadmin por defecto (acceso directo a db).
   */
  async seedSuperAdmin(passwordHash: string) {
    const email = 'superadmin@equipo09.com';
    
    const existing = await this.queryOne(`SELECT id FROM users WHERE email = $1`, [email]);
    if (existing) {
       await this.query(`UPDATE users SET password_hash = $1 WHERE email = $2`, [passwordHash, email]);
       const profile = await this.queryOne(`SELECT id FROM admin_profiles WHERE user_id = $1`, [existing.id]);
       if (!profile) {
          await this.queryOne(
            `INSERT INTO admin_profiles (user_id, first_name, last_name, access_level, can_approve_campaigns, can_manage_users, can_manage_finances, is_active)
             VALUES ($1, 'Super', 'Admin', 'super_admin', true, true, true, true)
             RETURNING *`,
            [existing.id]
          );
       }
       return;
    }

    const newUser = await this.queryOne(
      `INSERT INTO users (email, password_hash, email_verified, is_active, preferred_language)
       VALUES ($1, $2, true, true, 'es')
       RETURNING *`,
      [email, passwordHash]
    );

    if (newUser) {
      await this.queryOne(
        `INSERT INTO admin_profiles (user_id, first_name, last_name, access_level, can_approve_campaigns, can_manage_users, can_manage_finances, is_active)
         VALUES ($1, 'Super', 'Admin', 'super_admin', true, true, true, true)
         RETURNING *`,
        [newUser.id]
      );
    }
  }
}
