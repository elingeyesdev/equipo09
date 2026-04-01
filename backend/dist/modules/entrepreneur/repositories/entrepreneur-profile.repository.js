"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntrepreneurProfileRepository = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../../common/database");
const models_1 = require("../models");
let EntrepreneurProfileRepository = class EntrepreneurProfileRepository extends database_1.BaseRepository {
    async findById(id) {
        const row = await this.queryOne(`SELECT * FROM entrepreneur_profiles WHERE id = $1`, [id]);
        return row ? (0, models_1.mapRowToEntrepreneurProfile)(row) : null;
    }
    async findByUserId(userId) {
        const row = await this.queryOne(`SELECT * FROM entrepreneur_profiles WHERE user_id = $1`, [userId]);
        return row ? (0, models_1.mapRowToEntrepreneurProfile)(row) : null;
    }
    async create(userId, dto) {
        return this.transaction(async (client) => {
            const result = await client.query(`INSERT INTO entrepreneur_profiles (
          user_id, first_name, last_name, display_name, bio,
          company_name, website, linkedin_url,
          address_line, city, state, country, postal_code,
          bank_account_number, bank_name
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14, $15
        )
        RETURNING *`, [
                userId,
                dto.firstName,
                dto.lastName,
                dto.displayName ?? null,
                dto.bio ?? null,
                dto.companyName ?? null,
                dto.website ?? null,
                dto.linkedinUrl ?? null,
                dto.addressLine ?? null,
                dto.city ?? null,
                dto.state ?? null,
                dto.country ?? null,
                dto.postalCode ?? null,
                dto.bankAccountNumber ?? null,
                dto.bankName ?? null,
            ]);
            await client.query(`INSERT INTO user_roles (user_id, role_id)
         SELECT $1, r.id FROM roles r WHERE r.name = 'entrepreneur'
         ON CONFLICT (user_id, role_id) DO NOTHING`, [userId]);
            return (0, models_1.mapRowToEntrepreneurProfile)(result.rows[0]);
        });
    }
    async update(userId, dto) {
        const fieldMap = {
            first_name: dto.firstName,
            last_name: dto.lastName,
            display_name: dto.displayName,
            bio: dto.bio,
            company_name: dto.companyName,
            website: dto.website,
            linkedin_url: dto.linkedinUrl,
            address_line: dto.addressLine,
            city: dto.city,
            state: dto.state,
            country: dto.country,
            postal_code: dto.postalCode,
            bank_account_number: dto.bankAccountNumber,
            bank_name: dto.bankName,
        };
        const entries = Object.entries(fieldMap).filter(([, value]) => value !== undefined);
        if (entries.length === 0) {
            return this.findByUserId(userId);
        }
        const setClauses = entries.map(([key], index) => `${key} = $${index + 1}`);
        const values = entries.map(([, value]) => value);
        const paramIndex = values.length + 1;
        const row = await this.queryOne(`UPDATE entrepreneur_profiles
       SET ${setClauses.join(', ')}
       WHERE user_id = $${paramIndex}
       RETURNING *`, [...values, userId]);
        return row ? (0, models_1.mapRowToEntrepreneurProfile)(row) : null;
    }
    async existsByUserId(userId) {
        const result = await this.queryOne(`SELECT 1 FROM entrepreneur_profiles WHERE user_id = $1`, [userId]);
        return result !== null;
    }
    async incrementCampaignCount(userId) {
        await this.query(`UPDATE entrepreneur_profiles
       SET total_campaigns = total_campaigns + 1
       WHERE user_id = $1`, [userId]);
    }
    async refreshTotalRaised(userId) {
        await this.query(`UPDATE entrepreneur_profiles ep
       SET total_raised = COALESCE((
         SELECT SUM(c.current_amount)
         FROM campaigns c
         WHERE c.creator_id = ep.user_id
           AND c.status IN ('published', 'funded', 'completed')
       ), 0)
       WHERE ep.user_id = $1`, [userId]);
    }
};
exports.EntrepreneurProfileRepository = EntrepreneurProfileRepository;
exports.EntrepreneurProfileRepository = EntrepreneurProfileRepository = __decorate([
    (0, common_1.Injectable)()
], EntrepreneurProfileRepository);
//# sourceMappingURL=entrepreneur-profile.repository.js.map