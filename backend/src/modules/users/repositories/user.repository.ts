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
   * Busca un usuario por ID.
   */
  async findById(id: string): Promise<User | null> {
    const row = await this.queryOne(
      `SELECT * FROM users WHERE id = $1`,
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
      `SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND is_active = true`,
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
}
