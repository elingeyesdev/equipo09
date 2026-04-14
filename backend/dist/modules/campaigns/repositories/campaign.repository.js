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
exports.CampaignRepository = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
let CampaignRepository = class CampaignRepository {
    constructor(pool) {
        this.pool = pool;
        this.PUBLIC_STATUSES = ['published', 'funded', 'partially_funded'];
        this.PUBLIC_SELECT = `
    SELECT
      c.id, c.title, c.slug, c.short_description,
      c.campaign_type, c.status,
      c.goal_amount, c.current_amount, c.investor_count,
      c.cover_image_url, c.end_date, c.created_at,
      ep.first_name || ' ' || ep.last_name AS entrepreneur_name,
      ep.display_name AS entrepreneur_display_name,
      ep.avatar_url AS entrepreneur_avatar,
      cat.display_name AS category_name,
      cat.slug AS category_slug
    FROM campaigns c
    JOIN entrepreneur_profiles ep ON c.creator_id = ep.user_id
    JOIN categories cat ON c.category_id = cat.id
  `;
    }
    mapRowToCampaign(row) {
        return {
            id: row.id,
            creatorId: row.creator_id,
            categoryId: row.category_id,
            title: row.title,
            slug: row.slug,
            subtitle: row.subtitle,
            description: row.description,
            shortDescription: row.short_description,
            campaignType: row.campaign_type,
            status: row.status,
            goalAmount: parseFloat(row.goal_amount),
            currentAmount: parseFloat(row.current_amount),
            minInvestment: parseFloat(row.min_investment || '0'),
            maxInvestment: row.max_investment ? parseFloat(row.max_investment) : null,
            equityPercentage: row.equity_percentage ? parseFloat(row.equity_percentage) : null,
            startDate: row.start_date,
            endDate: row.end_date,
            fundsRaised: parseFloat(row.funds_raised || '0'),
            investorsCount: parseInt(row.investors_count || '0', 10),
            metadata: row.metadata,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async create(userId, dto) {
        const slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        let categoryId = dto.categoryId;
        if (!categoryId) {
            const cat = await this.pool.query(`SELECT id FROM categories LIMIT 1`);
            if (!cat.rows[0]) {
                throw new common_1.BadRequestException('No hay categorías en la base de datos. Ejecuta el seed de categorías.');
            }
            categoryId = cat.rows[0].id;
        }
        const query = `
      INSERT INTO campaigns (
        creator_id, category_id, title, slug, description, short_description, 
        campaign_type, status, goal_amount, end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_review', $8, $9)
      RETURNING *;
    `;
        const endDateStr = dto.endDate ? new Date(dto.endDate).toISOString() : null;
        const values = [
            userId,
            categoryId,
            dto.title,
            slug,
            dto.description,
            dto.shortDescription || null,
            dto.campaignType,
            dto.goalAmount,
            endDateStr,
        ];
        const { rows } = await this.pool.query(query, values);
        return this.mapRowToCampaign(rows[0]);
    }
    async findByCreatorId(userId, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC') {
        const offset = (page - 1) * limit;
        const queryData = `
      SELECT * FROM campaigns
      WHERE creator_id = $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3;
    `;
        const dataValues = [userId, limit, offset];
        const queryCount = `SELECT COUNT(*) FROM campaigns WHERE creator_id = $1;`;
        const countValues = [userId];
        const [dataResult, countResult] = await Promise.all([
            this.pool.query(queryData, dataValues),
            this.pool.query(queryCount, countValues),
        ]);
        const totalItems = parseInt(countResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalItems / limit);
        return {
            data: dataResult.rows.map(row => this.mapRowToCampaign(row)),
            meta: {
                totalItems,
                itemCount: dataResult.rows.length,
                itemsPerPage: limit,
                totalPages,
                currentPage: page,
            },
        };
    }
    async findByIdAndCreator(id, creatorId) {
        const query = `SELECT * FROM campaigns WHERE id = $1 AND creator_id = $2;`;
        const { rows } = await this.pool.query(query, [id, creatorId]);
        return rows.length > 0 ? this.mapRowToCampaign(rows[0]) : null;
    }
    mapRowToPublicCampaign(row) {
        return {
            id: row.id,
            title: row.title,
            slug: row.slug,
            shortDescription: row.short_description,
            campaignType: row.campaign_type,
            status: row.status,
            goalAmount: parseFloat(row.goal_amount),
            currentAmount: parseFloat(row.current_amount),
            investorCount: parseInt(row.investor_count || '0', 10),
            coverImageUrl: row.cover_image_url,
            endDate: row.end_date,
            createdAt: row.created_at,
            entrepreneurName: row.entrepreneur_name,
            entrepreneurDisplayName: row.entrepreneur_display_name,
            entrepreneurAvatar: row.entrepreneur_avatar,
            categoryName: row.category_name,
            categorySlug: row.category_slug,
        };
    }
    async findPublicCampaigns(page = 1, limit = 12, sortBy = 'created_at', sortOrder = 'DESC', categoryId, campaignType, search) {
        const offset = (page - 1) * limit;
        const conditions = [`c.status IN ('published', 'funded', 'partially_funded')`];
        const params = [];
        let paramIndex = 1;
        if (categoryId) {
            conditions.push(`c.category_id = $${paramIndex}`);
            params.push(categoryId);
            paramIndex++;
        }
        if (campaignType) {
            conditions.push(`c.campaign_type = $${paramIndex}`);
            params.push(campaignType);
            paramIndex++;
        }
        if (search) {
            conditions.push(`(c.title ILIKE $${paramIndex} OR c.short_description ILIKE $${paramIndex})`);
            params.push(`%${search}%`);
            paramIndex++;
        }
        const whereClause = conditions.join(' AND ');
        const allowedSorts = ['created_at', 'current_amount', 'goal_amount', 'end_date'];
        const safeSortBy = allowedSorts.includes(sortBy) ? sortBy : 'created_at';
        const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
        const countQuery = `SELECT COUNT(*) FROM campaigns c WHERE ${whereClause}`;
        const countResult = await this.pool.query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].count, 10);
        const dataQuery = `
      ${this.PUBLIC_SELECT}
      WHERE ${whereClause}
      ORDER BY c.${safeSortBy} ${safeSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;
        const dataResult = await this.pool.query(dataQuery, [...params, limit, offset]);
        const totalPages = Math.ceil(totalItems / limit);
        return {
            data: dataResult.rows.map(row => this.mapRowToPublicCampaign(row)),
            meta: {
                totalItems,
                itemCount: dataResult.rows.length,
                itemsPerPage: limit,
                totalPages,
                currentPage: page,
            },
        };
    }
    async findPublicById(id) {
        const query = `
      SELECT
        c.id, c.title, c.slug, c.subtitle, c.short_description,
        c.description, c.campaign_type, c.status,
        c.goal_amount, c.current_amount, c.investor_count,
        c.cover_image_url, c.currency,
        c.min_investment, c.max_investment,
        c.start_date, c.end_date, c.created_at,
        ep.first_name || ' ' || ep.last_name AS entrepreneur_name,
        ep.display_name AS entrepreneur_display_name,
        ep.avatar_url AS entrepreneur_avatar,
        ep.bio AS entrepreneur_bio,
        cat.display_name AS category_name,
        cat.slug AS category_slug
      FROM campaigns c
      JOIN entrepreneur_profiles ep ON c.creator_id = ep.user_id
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = $1 AND c.status IN ('published', 'funded', 'partially_funded');
    `;
        const { rows } = await this.pool.query(query, [id]);
        if (rows.length === 0)
            return null;
        const row = rows[0];
        return {
            ...this.mapRowToPublicCampaign(row),
            description: row.description,
            subtitle: row.subtitle,
            currency: row.currency,
            startDate: row.start_date,
            minInvestment: parseFloat(row.min_investment || '0'),
            maxInvestment: row.max_investment ? parseFloat(row.max_investment) : null,
            entrepreneurBio: row.entrepreneur_bio,
        };
    }
};
exports.CampaignRepository = CampaignRepository;
exports.CampaignRepository = CampaignRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE_POOL')),
    __metadata("design:paramtypes", [pg_1.Pool])
], CampaignRepository);
//# sourceMappingURL=campaign.repository.js.map