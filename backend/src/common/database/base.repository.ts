import { Inject, Injectable } from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { DATABASE_POOL } from '../../config/database.module';

/**
 * Base repository con helpers para queries PostgreSQL.
 * Todos los repositories concretos deben extender esta clase.
 */
@Injectable()
export abstract class BaseRepository {
  constructor(
    @Inject(DATABASE_POOL) protected readonly pool: Pool,
  ) {}

  /**
   * Ejecuta un query con parámetros y retorna todas las filas.
   */
  protected async query<T extends QueryResultRow = any>(
    sql: string,
    params?: any[],
  ): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      return await client.query<T>(sql, params);
    } finally {
      client.release();
    }
  }

  /**
   * Ejecuta un query y retorna la primera fila o null.
   */
  protected async queryOne<T extends QueryResultRow = any>(
    sql: string,
    params?: any[],
  ): Promise<T | null> {
    const result = await this.query<T>(sql, params);
    return result.rows[0] ?? null;
  }

  /**
   * Ejecuta un query y retorna todas las filas.
   */
  protected async queryMany<T extends QueryResultRow = any>(
    sql: string,
    params?: any[],
  ): Promise<T[]> {
    const result = await this.query<T>(sql, params);
    return result.rows;
  }

  /**
   * Ejecuta múltiples queries dentro de una transacción.
   */
  protected async transaction<T>(
    callback: (client: any) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Helper para generar SET clause dinámicamente para UPDATE queries.
   * Solo incluye campos que no son undefined.
   */
  protected buildUpdateSet(
    data: Record<string, any>,
    startIndex: number = 1,
  ): { clause: string; values: any[]; nextIndex: number } {
    const entries = Object.entries(data).filter(
      ([, value]) => value !== undefined,
    );

    const setClauses = entries.map(
      ([key], index) => `${this.toSnakeCase(key)} = $${startIndex + index}`,
    );

    return {
      clause: setClauses.join(', '),
      values: entries.map(([, value]) => value),
      nextIndex: startIndex + entries.length,
    };
  }

  /**
   * Convierte camelCase a snake_case para nombres de columna.
   */
  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
