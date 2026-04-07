"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestorProfileRepository = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../../common/database");
const models_1 = require("../models");
let InvestorProfileRepository = class InvestorProfileRepository extends database_1.BaseRepository {
    async findById(id) {
        const row = await this.queryOne(`SELECT * FROM investor_profiles WHERE id = $1`, [id]);
        return row ? (0, models_1.mapRowToInvestorProfile)(row) : null;
    }
    async findByUserId(userId) {
        const row = await this.queryOne(`SELECT * FROM investor_profiles WHERE user_id = $1`, [userId]);
        return row ? (0, models_1.mapRowToInvestorProfile)(row) : null;
    }
    async existsByUserId(userId) {
        const result = await this.queryOne(`SELECT 1 FROM investor_profiles WHERE user_id = $1`, [userId]);
        return result !== null;
    }
    async countInvestmentsByInvestor(userId) {
        const row = await this.queryOne(`SELECT COUNT(*)::text AS c FROM investments WHERE investor_id = $1`, [userId]);
        return row ? parseInt(row.c, 10) : 0;
    }
    async deleteByUserId(userId) {
        const result = await this.query(`DELETE FROM investor_profiles WHERE user_id = $1`, [userId]);
        return (result.rowCount ?? 0) > 0;
    }
    async create(userId, dto) {
        return this.transaction(async (client) => {
            const result = await client.query(`INSERT INTO investor_profiles (
          user_id, first_name, last_name, display_name, bio,
          investor_type, tax_id,
          address_line1, address_line2, city, state, country, postal_code,
          preferred_categories, min_investment, max_investment
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16
        )
        RETURNING *`, [
                userId,
                dto.firstName,
                dto.lastName,
                dto.displayName ?? null,
                dto.bio ?? null,
                dto.investorType ?? 'individual',
                dto.taxId ?? null,
                dto.addressLine1 ?? null,
                dto.addressLine2 ?? null,
                dto.city ?? null,
                dto.state ?? null,
                dto.country ?? null,
                dto.postalCode ?? null,
                JSON.stringify(dto.preferredCategories ?? []),
                dto.minInvestment ?? null,
                dto.maxInvestment ?? null,
            ]);
            await client.query(`INSERT INTO user_roles (user_id, role_id)
         SELECT $1, r.id FROM roles r WHERE r.name = 'investor'
         ON CONFLICT (user_id, role_id) DO NOTHING`, [userId]);
            return (0, models_1.mapRowToInvestorProfile)(result.rows[0]);
        });
    }
    async update(userId, dto) {
        const fieldMap = {
            first_name: dto.firstName,
            last_name: dto.lastName,
            display_name: dto.displayName,
            bio: dto.bio,
            investor_type: dto.investorType,
            tax_id: dto.taxId,
            address_line1: dto.addressLine1,
            address_line2: dto.addressLine2,
            city: dto.city,
            state: dto.state,
            country: dto.country,
            postal_code: dto.postalCode,
            preferred_categories: dto.preferredCategories !== undefined
                ? JSON.stringify(dto.preferredCategories)
                : undefined,
            min_investment: dto.minInvestment,
            max_investment: dto.maxInvestment,
        };
        const entries = Object.entries(fieldMap).filter(([, value]) => value !== undefined);
        if (entries.length === 0) {
            return this.findByUserId(userId);
        }
        const setClauses = entries.map(([key], index) => `${key} = $${index + 1}`);
        const values = entries.map(([, value]) => value);
        const paramIndex = values.length + 1;
        const row = await this.queryOne(`UPDATE investor_profiles
       SET ${setClauses.join(', ')}
       WHERE user_id = $${paramIndex}
       RETURNING *`, [...values, userId]);
        return row ? (0, models_1.mapRowToInvestorProfile)(row) : null;
    }
    async getCapitalOverview(userId) {
        const row = await this.queryOne(`
      SELECT 
        ip.total_investments,
        ip.total_invested,
        ip.max_investment,
        (ip.max_investment - ip.total_invested) AS available_capital,
        COUNT(i.id) FILTER (WHERE i.status = 'completed') AS completed_investments,
        SUM(i.amount) FILTER (WHERE i.status = 'pending') AS pending_amount
      FROM investor_profiles ip
      LEFT JOIN investments i ON i.investor_id = ip.user_id
      WHERE ip.user_id = $1
      GROUP BY ip.id
    `, [userId]);
        if (!row)
            return null;
        return {
            totalInvestments: Number(row.total_investments) || 0,
            totalInvested: Number(row.total_invested) || 0,
            maxInvestmentLimit: row.max_investment ? Number(row.max_investment) : null,
            availableCapital: row.available_capital ? Number(row.available_capital) : null,
            completedInvestments: Number(row.completed_investments) || 0,
            pendingAmount: Number(row.pending_amount) || 0,
        };
    }
};
exports.InvestorProfileRepository = InvestorProfileRepository;
exports.InvestorProfileRepository = InvestorProfileRepository = __decorate([
    (0, common_1.Injectable)()
], InvestorProfileRepository);
//# sourceMappingURL=investor-profile.repository.js.map