"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntrepreneurCampaignRepository = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../../common/database");
const models_1 = require("../models");
const reward_tier_model_1 = require("../../reward-tiers/models/reward-tier.model");
let EntrepreneurCampaignRepository = class EntrepreneurCampaignRepository extends database_1.BaseRepository {
    async create(creatorId, dto) {
        const baseSlug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const slug = `${baseSlug}-${randomSuffix}`;
        let categoryId = dto.categoryId;
        if (!categoryId) {
            const cat = await this.queryOne(`SELECT id FROM categories LIMIT 1`);
            if (!cat)
                throw new Error('No categories found in database to assign to campaign');
            categoryId = cat.id;
        }
        return this.transaction(async (client) => {
            const result = await client.query(`INSERT INTO campaigns (
          creator_id, category_id, title, slug, short_description, description,
          campaign_type, goal_amount, end_date, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft') RETURNING id`, [
                creatorId,
                categoryId,
                dto.title,
                slug,
                dto.shortDescription || null,
                dto.description,
                dto.campaignType,
                dto.goalAmount,
                dto.endDate || null
            ]);
            const campaignId = result.rows[0].id;
            if (dto.rewards && Array.isArray(dto.rewards) && dto.rewards.length > 0) {
                for (const reward of dto.rewards) {
                    await client.query(`INSERT INTO reward_tiers (
              campaign_id, title, description, amount, max_claims, is_active
            ) VALUES ($1, $2, $3, $4, $5, true)`, [
                        campaignId,
                        reward.title,
                        reward.description,
                        reward.amount,
                        reward.maxClaims || null
                    ]);
                }
            }
            const created = await this.findOneByCreatorId(campaignId, creatorId, {
                queryOne: (sql, params) => client.query(sql, params).then((r) => r.rows[0]),
                queryMany: (sql, params) => client.query(sql, params).then((r) => r.rows),
            });
            if (!created)
                throw new Error('Error al recuperar campaña creada');
            return created;
        });
    }
    async findByCreatorId(creatorId, query) {
        const conditions = ['c.creator_id = $1'];
        const params = [creatorId];
        let paramIndex = 2;
        if (query.status) {
            conditions.push(`c.status = $${paramIndex}`);
            params.push(query.status);
            paramIndex++;
        }
        else if (query.filterPreset && query.filterPreset !== 'all') {
            switch (query.filterPreset) {
                case 'draft':
                    conditions.push(`c.status = 'draft'`);
                    break;
                case 'approval':
                    conditions.push(`c.status IN ('pending_review', 'in_review', 'approved')`);
                    break;
                case 'published':
                    conditions.push(`c.status IN ('published', 'funded', 'partially_funded', 'completed')`);
                    break;
                case 'archived':
                    conditions.push(`c.status IN ('failed', 'cancelled', 'rejected', 'suspended')`);
                    break;
                default:
                    break;
            }
        }
        if (query.campaignType) {
            conditions.push(`c.campaign_type = $${paramIndex}`);
            params.push(query.campaignType);
            paramIndex++;
        }
        if (query.search) {
            conditions.push(`c.title ILIKE $${paramIndex}`);
            params.push(`%${query.search}%`);
            paramIndex++;
        }
        if (query.createdFrom) {
            conditions.push(`c.created_at >= $${paramIndex}::date`);
            params.push(query.createdFrom);
            paramIndex++;
        }
        if (query.createdTo) {
            conditions.push(`c.created_at < ($${paramIndex}::date + interval '1 day')`);
            params.push(query.createdTo);
            paramIndex++;
        }
        if (query.endDateFrom) {
            conditions.push(`c.end_date IS NOT NULL AND c.end_date >= $${paramIndex}::date`);
            params.push(query.endDateFrom);
            paramIndex++;
        }
        if (query.endDateTo) {
            conditions.push(`c.end_date IS NOT NULL AND c.end_date < ($${paramIndex}::date + interval '1 day')`);
            params.push(query.endDateTo);
            paramIndex++;
        }
        const whereClause = conditions.join(' AND ');
        const allowedSorts = ['created_at', 'current_amount', 'goal_amount', 'end_date', 'title'];
        const sortBy = allowedSorts.includes(query.sortBy ?? '')
            ? query.sortBy
            : 'created_at';
        const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
        const countResult = await this.queryOne(`SELECT COUNT(*) as total
       FROM campaigns c
       WHERE ${whereClause}`, params);
        const total = parseInt(countResult?.total ?? '0', 10);
        const campaigns = await this.queryMany(`SELECT
        c.id, c.title, c.slug, c.short_description, c.campaign_type,
        c.status, c.goal_amount, c.current_amount, c.investor_count,
        c.currency, c.cover_image_url, c.start_date, c.end_date,
        c.funded_at, c.is_featured, c.view_count,
        c.created_at, c.updated_at, c.published_at,
        cat.display_name AS category_name,
        cat.slug AS category_slug,
        c.category_id,
        c.description
       FROM campaigns c
       JOIN categories cat ON c.category_id = cat.id
       WHERE ${whereClause}
       ORDER BY c.${sortBy} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, [...params, query.limit, query.offset]);
        return {
            campaigns: campaigns.map(models_1.mapRowToEntrepreneurCampaign),
            total,
        };
    }
    async findOneByCreatorId(campaignId, creatorId, client) {
        const executor = client || this;
        const row = await executor.queryOne(`SELECT
        c.id, c.title, c.slug, c.short_description, c.campaign_type,
        c.status, c.goal_amount, c.current_amount, c.investor_count,
        c.currency, c.cover_image_url, c.start_date, c.end_date,
        c.funded_at, c.is_featured, c.view_count,
        c.created_at, c.updated_at, c.published_at,
        cat.display_name AS category_name,
        cat.slug AS category_slug,
        c.category_id,
        c.description
       FROM campaigns c
       JOIN categories cat ON c.category_id = cat.id
       WHERE c.id = $1 AND c.creator_id = $2`, [campaignId, creatorId]);
        if (!row)
            return null;
        const rewardTiers = await executor.queryMany('SELECT * FROM reward_tiers WHERE campaign_id = $1 ORDER BY amount ASC', [campaignId]);
        const campaign = (0, models_1.mapRowToEntrepreneurCampaign)(row);
        campaign.rewardTiers = rewardTiers.map(reward_tier_model_1.mapRowToRewardTier);
        return campaign;
    }
    async submitForReview(campaignId, creatorId) {
        return this.transaction(async (client) => {
            const current = await client.query('SELECT status FROM campaigns WHERE id = $1 AND creator_id = $2', [campaignId, creatorId]);
            if (current.rows.length === 0)
                return null;
            const oldStatus = current.rows[0].status;
            if (oldStatus !== 'draft' && oldStatus !== 'rejected')
                return null;
            const res = await client.query(`UPDATE campaigns
         SET status = 'pending_review', updated_at = NOW()
         WHERE id = $1 AND creator_id = $2
         RETURNING id`, [campaignId, creatorId]);
            if (res.rows.length > 0) {
                await client.query(`INSERT INTO campaign_status_history (campaign_id, from_status, to_status, changed_by, reason)
           VALUES ($1, $2, $3, $4, $5)`, [campaignId, oldStatus, 'pending_review', creatorId, 'Envío para revisión (Emprendedor)']);
            }
            return this.findOneByCreatorId(campaignId, creatorId, {
                queryOne: (sql, params) => client.query(sql, params).then((r) => r.rows[0]),
                queryMany: (sql, params) => client.query(sql, params).then((r) => r.rows),
            });
        });
    }
    async publishCampaign(campaignId, creatorId) {
        return this.transaction(async (client) => {
            const current = await client.query('SELECT status FROM campaigns WHERE id = $1 AND creator_id = $2', [campaignId, creatorId]);
            if (current.rows.length === 0)
                return null;
            const oldStatus = current.rows[0].status;
            if (oldStatus !== 'draft' && oldStatus !== 'approved')
                return null;
            const res = await client.query(`UPDATE campaigns
         SET status = 'published', published_at = COALESCE(published_at, NOW()), updated_at = NOW()
         WHERE id = $1 AND creator_id = $2
         RETURNING id`, [campaignId, creatorId]);
            if (res.rows.length > 0) {
                await client.query(`INSERT INTO campaign_status_history (campaign_id, from_status, to_status, changed_by, reason)
           VALUES ($1, $2, $3, $4, $5)`, [campaignId, oldStatus, 'published', creatorId, 'Lanzamiento público (Emprendedor)']);
            }
            return this.findOneByCreatorId(campaignId, creatorId, {
                queryOne: (sql, params) => client.query(sql, params).then((r) => r.rows[0]),
                queryMany: (sql, params) => client.query(sql, params).then((r) => r.rows),
            });
        });
    }
    async validateRewardsSum(campaignId) {
        const campaign = await this.queryOne(`SELECT goal_amount, campaign_type FROM campaigns WHERE id = $1`, [campaignId]);
        if (!campaign || campaign.campaign_type !== 'reward')
            return true;
        const sumResult = await this.queryOne(`SELECT SUM(amount * max_claims) as total_value FROM reward_tiers WHERE campaign_id = $1 AND is_active = true`, [campaignId]);
        const totalValue = Number(sumResult?.total_value) || 0;
        const goalAmount = Number(campaign.goal_amount) || 0;
        return totalValue === goalAmount;
    }
    async updateCoverImageUrl(campaignId, creatorId, coverImageUrl) {
        const row = await this.queryOne(`UPDATE campaigns
       SET cover_image_url = $1, updated_at = NOW()
       WHERE id = $2 AND creator_id = $3
       RETURNING id`, [coverImageUrl, campaignId, creatorId]);
        if (!row)
            return null;
        return this.findOneByCreatorId(campaignId, creatorId);
    }
    async update(campaignId, creatorId, dto) {
        const updates = ['updated_at = NOW()'];
        const values = [campaignId, creatorId];
        let paramIndex = 3;
        if (dto.title !== undefined) {
            updates.push(`title = $${paramIndex++}`);
            values.push(dto.title);
        }
        if (dto.description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(dto.description);
        }
        if (dto.shortDescription !== undefined) {
            updates.push(`short_description = $${paramIndex++}`);
            values.push(dto.shortDescription);
        }
        if (dto.goalAmount !== undefined) {
            updates.push(`goal_amount = $${paramIndex++}`);
            values.push(dto.goalAmount);
        }
        if (dto.categoryId !== undefined) {
            updates.push(`category_id = $${paramIndex++}`);
            values.push(dto.categoryId);
        }
        if (dto.endDate !== undefined) {
            updates.push(`end_date = $${paramIndex++}`);
            values.push(dto.endDate || null);
        }
        if (dto.campaignType !== undefined) {
            updates.push(`campaign_type = $${paramIndex++}`);
            values.push(dto.campaignType);
        }
        return this.transaction(async (client) => {
            const query = `
        UPDATE campaigns
        SET ${updates.join(', ')}
        WHERE id = $1 AND creator_id = $2
        RETURNING id
      `;
            const result = await client.query(query, values);
            if (result.rowCount === 0)
                return null;
            if (dto.rewards && Array.isArray(dto.rewards)) {
                await client.query('DELETE FROM reward_tiers WHERE campaign_id = $1', [campaignId]);
                for (const reward of dto.rewards) {
                    await client.query(`INSERT INTO reward_tiers (
              campaign_id, title, description, amount, max_claims, is_active
            ) VALUES ($1, $2, $3, $4, $5, true)`, [
                        campaignId,
                        reward.title,
                        reward.description,
                        reward.amount,
                        reward.maxClaims || null
                    ]);
                }
            }
            return this.findOneByCreatorId(campaignId, creatorId, {
                queryOne: (sql, params) => client.query(sql, params).then((r) => r.rows[0]),
                queryMany: (sql, params) => client.query(sql, params).then((r) => r.rows),
            });
        });
    }
    async getFinancialProgress(campaignId, creatorId) {
        const campaign = await this.queryOne(`SELECT id FROM campaigns WHERE id = $1 AND creator_id = $2`, [campaignId, creatorId]);
        if (!campaign)
            return null;
        return this.getFinancialProgressShared(campaignId);
    }
    async getFinancialProgressAdmin(campaignId) {
        return this.getFinancialProgressShared(campaignId);
    }
    async getFinancialProgressShared(campaignId) {
        const campaign = await this.queryOne(`SELECT
        c.id, c.title, c.slug, c.status,
        c.goal_amount, c.current_amount, c.investor_count,
        c.currency, c.start_date, c.end_date, c.funded_at
       FROM campaigns c
       WHERE c.id = $1`, [campaignId]);
        if (!campaign)
            return null;
        const investmentStats = await this.queryOne(`SELECT
        COUNT(*)::int                                                         AS total_investments,
        COUNT(*) FILTER (WHERE status = 'completed')::int                     AS completed_investments,
        COUNT(*) FILTER (WHERE status = 'pending')::int                       AS pending_investments,
        COUNT(*) FILTER (WHERE status = 'failed')::int                        AS failed_investments,
        COUNT(*) FILTER (WHERE status IN ('refunded','partially_refunded'))::int AS refunded_investments,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0)          AS confirmed_amount,
        COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0)            AS pending_amount,
        COALESCE(SUM(refunded_amount) FILTER (WHERE status IN ('refunded','partially_refunded')), 0) AS refunded_amount,
        COALESCE(AVG(amount) FILTER (WHERE status = 'completed'), 0)          AS avg_investment,
        COALESCE(MAX(amount) FILTER (WHERE status = 'completed'), 0)          AS max_investment,
        COALESCE(MIN(amount) FILTER (WHERE status = 'completed'), 0)          AS min_investment
       FROM investments
       WHERE campaign_id = $1`, [campaignId]);
        const recentRows = await this.queryMany(`SELECT
        i.id, i.amount, i.currency, i.status,
        i.is_anonymous, i.created_at,
        rt.title as reward_title,
        CASE
          WHEN i.is_anonymous THEN NULL
          ELSE COALESCE(ip.display_name, ip.first_name || ' ' || ip.last_name)
        END AS investor_display_name
       FROM investments i
       LEFT JOIN investor_profiles ip ON i.investor_id = ip.user_id
       LEFT JOIN reward_tiers rt ON i.reward_tier_id = rt.id
       WHERE i.campaign_id = $1
       ORDER BY i.created_at DESC
       LIMIT 10`, [campaignId]);
        const goalAmount = Number(campaign.goal_amount);
        const currentAmount = Number(campaign.current_amount);
        let daysRemaining = null;
        if (campaign.end_date) {
            const msRemaining = new Date(campaign.end_date).getTime() - Date.now();
            daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
        }
        return {
            campaignId: campaign.id,
            title: campaign.title,
            slug: campaign.slug,
            status: campaign.status,
            goalAmount,
            currentAmount,
            remainingAmount: Math.max(0, goalAmount - currentAmount),
            fundingPercentage: goalAmount > 0
                ? Math.round((currentAmount / goalAmount) * 10000) / 100
                : 0,
            investorCount: Number(campaign.investor_count),
            currency: campaign.currency,
            startDate: campaign.start_date,
            endDate: campaign.end_date,
            daysRemaining,
            fundedAt: campaign.funded_at,
            investments: {
                total: investmentStats?.total_investments ?? 0,
                completed: investmentStats?.completed_investments ?? 0,
                pending: investmentStats?.pending_investments ?? 0,
                failed: investmentStats?.failed_investments ?? 0,
                refunded: investmentStats?.refunded_investments ?? 0,
            },
            amounts: {
                confirmed: Number(investmentStats?.confirmed_amount ?? 0),
                pending: Number(investmentStats?.pending_amount ?? 0),
                refunded: Number(investmentStats?.refunded_amount ?? 0),
            },
            averageInvestment: Number(investmentStats?.avg_investment ?? 0),
            largestInvestment: Number(investmentStats?.max_investment ?? 0),
            smallestInvestment: Number(investmentStats?.min_investment ?? 0),
            recentInvestments: recentRows.map((row) => ({
                id: row.id,
                amount: Number(row.amount),
                currency: row.currency,
                status: row.status,
                isAnonymous: row.is_anonymous,
                investorDisplayName: row.investor_display_name,
                rewardTitle: row.reward_title,
                createdAt: row.created_at,
            })),
        };
    }
    async getFinancialSummary(creatorId) {
        const row = await this.queryOne(`SELECT
        COUNT(*)::int AS total_campaigns,
        COUNT(*) FILTER (WHERE status IN ('published', 'funded'))::int AS active_campaigns,
        COUNT(*) FILTER (WHERE status IN ('funded', 'completed'))::int AS funded_campaigns,
        COALESCE(SUM(current_amount) FILTER (WHERE status IN ('published', 'funded', 'completed')), 0) AS total_raised,
        COALESCE(SUM(investor_count) FILTER (WHERE status IN ('published', 'funded', 'completed')), 0)::int AS total_investors,
        CASE
          WHEN COUNT(*) FILTER (WHERE status IN ('published', 'funded', 'completed')) > 0
          THEN COALESCE(
            SUM(current_amount) FILTER (WHERE status IN ('published', 'funded', 'completed'))
            / COUNT(*) FILTER (WHERE status IN ('published', 'funded', 'completed')),
            0
          )
          ELSE 0
        END AS avg_per_campaign
       FROM campaigns
       WHERE creator_id = $1`, [creatorId]);
        return {
            totalCampaigns: row?.total_campaigns ?? 0,
            activeCampaigns: row?.active_campaigns ?? 0,
            fundedCampaigns: row?.funded_campaigns ?? 0,
            totalRaised: Number(row?.total_raised ?? 0),
            totalInvestors: row?.total_investors ?? 0,
            averagePerCampaign: Number(row?.avg_per_campaign ?? 0),
            currency: 'USD',
        };
    }
    async getHistory(campaignId) {
        return this.queryMany(`
      SELECT 
        h.id,
        h.from_status,
        h.to_status,
        h.reason as feedback,
        h.created_at,
        u.email as changed_by_email,
        COALESCE(ap.first_name || ' ' || ap.last_name, u.email) as changed_by_name
      FROM campaign_status_history h
      LEFT JOIN users u ON h.changed_by = u.id
      LEFT JOIN admin_profiles ap ON u.id = ap.user_id
      WHERE h.campaign_id = $1
      ORDER BY h.created_at DESC
    `, [campaignId]);
    }
    async getCampaignInvestors(campaignId, creatorId, query = {}) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const offset = (page - 1) * limit;
        const conditions = ['id = $1'];
        const params = [campaignId];
        if (creatorId) {
            conditions.push('creator_id = $2');
            params.push(creatorId);
        }
        const campaign = await this.queryOne(`SELECT id FROM campaigns WHERE ${conditions.join(' AND ')}`, params);
        if (!campaign)
            return { investors: [], total: 0 };
        const totalRes = await this.queryOne(`SELECT COUNT(DISTINCT investor_id) as total FROM investments WHERE campaign_id = $1 AND status = 'completed'`, [campaignId]);
        const total = parseInt(totalRes.total, 10);
        const rows = await this.queryMany(`SELECT 
        i.id as investment_id,
        i.amount,
        i.created_at,
        rt.title as reward_title,
        rt.id as reward_tier_id,
        ip.user_id as investor_id,
        ip.first_name,
        ip.last_name,
        ip.display_name,
        ip.avatar_url,
        CONCAT(ip.city, ', ', ip.country) as location,
        ip.bio,
        u.email
      FROM investments i
      JOIN investor_profiles ip ON i.investor_id = ip.user_id
      JOIN users u ON i.investor_id = u.id
      LEFT JOIN reward_tiers rt ON i.reward_tier_id = rt.id
      WHERE i.campaign_id = $1 AND i.status = 'completed'
      ORDER BY i.created_at DESC
      LIMIT $2 OFFSET $3`, [campaignId, limit, offset]);
        return {
            investors: rows.map(row => ({
                userId: row.investor_id,
                firstName: row.first_name,
                lastName: row.last_name,
                displayName: row.display_name,
                avatarUrl: row.avatar_url,
                location: row.location,
                bio: row.bio,
                email: row.email,
                totalInvested: Number(row.amount),
                investmentCount: 1,
                lastInvestmentAt: row.created_at,
                investmentId: row.investment_id,
                rewardTitle: row.reward_title,
            })),
            total,
        };
    }
    async delete(campaignId, creatorId) {
        return this.transaction(async (client) => {
            const check = await client.query('SELECT status FROM campaigns WHERE id = $1 AND creator_id = $2', [campaignId, creatorId]);
            if (check.rowCount === 0)
                return false;
            const status = check.rows[0].status;
            if (status !== 'draft' && status !== 'rejected') {
                throw new Error('Solo se pueden eliminar campañas en borrador o rechazadas');
            }
            await client.query('DELETE FROM reward_tiers WHERE campaign_id = $1', [campaignId]);
            await client.query('DELETE FROM campaign_status_history WHERE campaign_id = $1', [campaignId]);
            const res = await client.query('DELETE FROM campaigns WHERE id = $1 AND creator_id = $2', [campaignId, creatorId]);
            return res.rowCount > 0;
        });
    }
    async finalize(campaignId, creatorId) {
        const res = await this.queryOne(`UPDATE campaigns 
       SET status = 'finished', updated_at = NOW() 
       WHERE id = $1 AND creator_id = $2 AND status = 'published'
       RETURNING id`, [campaignId, creatorId]);
        if (!res)
            return null;
        return this.findOneByCreatorId(campaignId, creatorId);
    }
};
exports.EntrepreneurCampaignRepository = EntrepreneurCampaignRepository;
exports.EntrepreneurCampaignRepository = EntrepreneurCampaignRepository = __decorate([
    (0, common_1.Injectable)()
], EntrepreneurCampaignRepository);
//# sourceMappingURL=entrepreneur-campaign.repository.js.map