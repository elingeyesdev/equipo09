"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const database_module_1 = require("../../config/database.module");
let BaseRepository = class BaseRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async query(sql, params) {
        const client = await this.pool.connect();
        try {
            return await client.query(sql, params);
        }
        finally {
            client.release();
        }
    }
    async queryOne(sql, params) {
        const result = await this.query(sql, params);
        return result.rows[0] ?? null;
    }
    async queryMany(sql, params) {
        const result = await this.query(sql, params);
        return result.rows;
    }
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    buildUpdateSet(data, startIndex = 1) {
        const entries = Object.entries(data).filter(([, value]) => value !== undefined);
        const setClauses = entries.map(([key], index) => `${this.toSnakeCase(key)} = $${startIndex + index}`);
        return {
            clause: setClauses.join(', '),
            values: entries.map(([, value]) => value),
            nextIndex: startIndex + entries.length,
        };
    }
    toSnakeCase(str) {
        return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    }
};
exports.BaseRepository = BaseRepository;
exports.BaseRepository = BaseRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], BaseRepository);
//# sourceMappingURL=base.repository.js.map