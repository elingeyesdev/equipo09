import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPool, Pool } from 'mysql2/promise';

export const DATABASE_POOL = 'DATABASE_POOL';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<Pool> => {
        const pool = createPool({
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 3306),
          user: configService.get<string>('DB_USER', 'root'),
          password: configService.get<string>('DB_PASSWORD', '1234'),
          database: configService.get<string>('DB_NAME', 'crowdfunding'),
          waitForConnections: true,
          connectionLimit: 20,
          queueLimit: 0,
          enableKeepAlive: true,
          keepAliveInitialDelayMs: 0,
        });

        pool.on('error', (err) => {
          console.error('❌ Unexpected DB pool error:', err.message);
        });

        pool.on('connection', () => {
          console.log('✅ DB pool: new client connected');
        });

        return pool;
      },
    },
  ],
  exports: [DATABASE_POOL],
})
export class DatabaseModule { }
