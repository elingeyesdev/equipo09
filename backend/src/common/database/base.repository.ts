import { Inject, Injectable } from '@nestjs/common';
import { Pool, PoolConnection } from 'mysql2/promise';
import { DATABASE_POOL } from '../../config/database.module';

interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

/**
 * Base repository con helpers para queries MySQL.
 * Todos los repositories concretos deben extender esta clase.
 * Mantiene API compatible con pg para minimizar cambios en repositorios existentes.
 */
@Injectable()
export abstract class BaseRepository {
  constructor(
    @Inject(DATABASE_POOL) protected readonly pool: Pool,
  ) {}

  /**
   * Ejecuta un query con parámetros y retorna resultado compatible con pg.
   */
  protected async query<T = any>(
    sql: string,
    params?: any[],
  ): Promise<QueryResult<T>> {
    const connection = await this.pool.getConnection();
    try {
      const [rows, fields] = await connection.execute(sql, params || []);
      return {
        rows: (rows as any[]) || [],
        rowCount: (rows as any[])?.length ?? 0,
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Ejecuta un query y retorna la primera fila o null.
   */
  protected async queryOne<T = any>(
    sql: string,
    params?: any[],
  ): Promise<T | null> {
    const result = await this.query<T>(sql, params);
    return result.rows[0] ?? null;
  }

  /**
   * Ejecuta un query y retorna todas las filas.
   */
  protected async queryMany<T = any>(
    sql: string,
    params?: any[],
  ): Promise<T[]> {
    const result = await this.query<T>(sql, params);
    return result.rows;
  }

  /**
   * Ejecuta múltiples queries dentro de una transacción.
   * Proporciona un cliente adaptado con métodos compatibles con pg.
   */
  protected async transaction<T>(
    callback: (client: any) => Promise<T>,
  ): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const adaptedClient = {
        query: async (sql: string, params?: any[]) => {
          const [rows] = await connection.execute(sql, params || []);
          return {
            rows: (rows as any[]) || [],
            rowCount: (rows as any[])?.length ?? 0,
          };
        },
        release: () => {}, // no-op para compatibilidad
      };

      const result = await callback(adaptedClient);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Helper para generar SET clause dinámicamente para UPDATE queries.
   * Solo incluye campos que no son undefined.
   * Retorna placeholders `?` para MySQL.
   */
  protected buildUpdateSet(
    data: Record<string, any>,
  ): { clause: string; values: any[] } {
    const entries = Object.entries(data).filter(
      ([, value]) => value !== undefined,
    );

    const setClauses = entries.map(
      ([key]) => `${this.toSnakeCase(key)} = ?`,
    );

    return {
      clause: setClauses.join(', '),
      values: entries.map(([, value]) => value),
    };
  }

  /**
   * Convierte camelCase a snake_case para nombres de columna.
   */
  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
