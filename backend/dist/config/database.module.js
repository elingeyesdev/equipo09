"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = exports.DATABASE_POOL = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pg_1 = require("pg");
exports.DATABASE_POOL = 'DATABASE_POOL';
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: exports.DATABASE_POOL,
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const pool = new pg_1.Pool({
                        host: configService.get('DB_HOST', 'localhost'),
                        port: configService.get('DB_PORT', 5432),
                        user: configService.get('DB_USER', 'postgres'),
                        password: configService.get('DB_PASSWORD', 'postgres'),
                        database: configService.get('DB_NAME', 'crowdfunding'),
                        ssl: configService.get('DB_SSL') === 'true'
                            ? { rejectUnauthorized: false }
                            : false,
                        max: 20,
                        idleTimeoutMillis: 30000,
                        connectionTimeoutMillis: 5000,
                    });
                    pool.on('error', (err) => {
                        console.error('❌ Unexpected DB pool error:', err.message);
                    });
                    pool.on('connect', () => {
                        console.log('✅ DB pool: new client connected');
                    });
                    return pool;
                },
            },
        ],
        exports: [exports.DATABASE_POOL],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map