import { Pool, QueryResult, QueryResultRow } from 'pg';
export declare abstract class BaseRepository {
    protected readonly pool: Pool;
    constructor(pool: Pool);
    protected query<T extends QueryResultRow = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
    protected queryOne<T extends QueryResultRow = any>(sql: string, params?: any[]): Promise<T | null>;
    protected queryMany<T extends QueryResultRow = any>(sql: string, params?: any[]): Promise<T[]>;
    protected transaction<T>(callback: (client: any) => Promise<T>): Promise<T>;
    protected buildUpdateSet(data: Record<string, any>, startIndex?: number): {
        clause: string;
        values: any[];
        nextIndex: number;
    };
    private toSnakeCase;
}
