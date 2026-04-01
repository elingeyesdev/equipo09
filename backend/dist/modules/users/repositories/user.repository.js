"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../../common/database");
const models_1 = require("../models");
const bcrypt = require("bcrypt");
let UserRepository = class UserRepository extends database_1.BaseRepository {
    async create(dto) {
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const row = await this.queryOne(`INSERT INTO users (email, password_hash, phone, preferred_language)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [
            dto.email.toLowerCase().trim(),
            passwordHash,
            dto.phone ?? null,
            dto.preferredLanguage ?? 'es',
        ]);
        return (0, models_1.mapRowToUser)(row);
    }
    async findById(id) {
        const row = await this.queryOne(`SELECT * FROM users WHERE id = $1`, [id]);
        return row ? (0, models_1.mapRowToUser)(row) : null;
    }
    async findByEmail(email) {
        const row = await this.queryOne(`SELECT * FROM users WHERE LOWER(email) = LOWER($1)`, [email]);
        return row ? (0, models_1.mapRowToUser)(row) : null;
    }
    async findByEmailWithPassword(email) {
        const row = await this.queryOne(`SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND is_active = true`, [email]);
        if (!row)
            return null;
        return {
            user: (0, models_1.mapRowToUser)(row),
            passwordHash: row.password_hash,
        };
    }
    async existsByEmail(email) {
        const row = await this.queryOne(`SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)`, [email]);
        return row !== null;
    }
    async findByIdWithRoles(id) {
        const row = await this.queryOne(`SELECT u.*,
              COALESCE(
                ARRAY_AGG(r.name) FILTER (WHERE r.name IS NOT NULL),
                ARRAY[]::VARCHAR[]
              ) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r       ON r.id = ur.role_id
       WHERE u.id = $1
       GROUP BY u.id`, [id]);
        return row ? (0, models_1.mapRowToUser)(row) : null;
    }
    async updateLastLogin(userId, ip) {
        await this.query(`UPDATE users
       SET last_login_at = NOW(), last_login_ip = $2, failed_login_attempts = 0
       WHERE id = $1`, [userId, ip ?? null]);
    }
    async incrementFailedAttempts(userId) {
        await this.query(`UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1`, [userId]);
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)()
], UserRepository);
//# sourceMappingURL=user.repository.js.map