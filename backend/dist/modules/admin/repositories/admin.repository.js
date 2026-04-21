"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../../common/database");
let AdminRepository = class AdminRepository extends database_1.BaseRepository {
    async getDashboardStats() {
        const usersCount = await this.queryOne(`SELECT COUNT(*) as count FROM users`);
        const campaignsCount = await this.queryOne(`SELECT COUNT(*) as count FROM campaigns`);
        const totalCurrentAmount = await this.queryOne(`SELECT COALESCE(SUM(current_amount), 0) as total FROM campaigns`);
        return {
            totalUsers: parseInt(usersCount.count, 10),
            totalCampaigns: parseInt(campaignsCount.count, 10),
            totalFunded: parseFloat(totalCurrentAmount.total),
        };
    }
    async getAllUsers() {
        return this.queryMany(`
      SELECT u.id, u.email, u.created_at, u.is_active 
      FROM users u
      LEFT JOIN admin_profiles a ON u.id = a.user_id
      WHERE a.id IS NULL
      ORDER BY u.created_at DESC
    `);
    }
    async getAllCampaigns() {
        return this.queryMany(`
      SELECT c.id, c.title, c.status, c.goal_amount, c.current_amount, c.created_at,
             u.email as creator_email
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      ORDER BY c.created_at DESC
    `);
    }
    async updateCampaignStatus(campaignId, status, reviewerId, feedback) {
        return this.transaction(async (client) => {
            const currentCampaign = await client.query('SELECT status FROM campaigns WHERE id = $1', [campaignId]);
            if (currentCampaign.rows.length === 0)
                return null;
            const oldStatus = currentCampaign.rows[0].status;
            let updatedCampaign;
            if (feedback) {
                updatedCampaign = await client.query(`
          UPDATE campaigns 
          SET status = $2, 
              metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{review_feedback}', to_jsonb($3::text)),
              updated_at = NOW() 
          WHERE id = $1 
          RETURNING *
        `, [campaignId, status, feedback]);
            }
            else {
                updatedCampaign = await client.query(`
          UPDATE campaigns 
          SET status = $2, updated_at = NOW() 
          WHERE id = $1 
          RETURNING *
        `, [campaignId, status]);
            }
            await client.query(`
        INSERT INTO campaign_status_history (campaign_id, from_status, to_status, changed_by, reason)
        VALUES ($1, $2, $3, $4, $5)
      `, [campaignId, oldStatus, status, reviewerId, feedback || 'Cambio de estado administrativo']);
            const reviewDecisions = ['approved', 'rejected', 'published', 'changes_requested'];
            if (reviewDecisions.includes(status) || feedback) {
                const decisionMap = {
                    'published': 'approved',
                    'approved': 'approved',
                    'rejected': 'rejected',
                    'changes_requested': 'changes_requested'
                };
                await client.query(`
          INSERT INTO campaign_reviews (campaign_id, reviewer_id, decision, feedback)
          VALUES ($1, $2, $3, $4)
        `, [campaignId, reviewerId, decisionMap[status] || 'approved', feedback]);
            }
            return updatedCampaign.rows[0];
        });
    }
    async getCampaignHistory(campaignId) {
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
    async createAdminProfile(userId, accessLevel) {
        return this.queryOne(`
      INSERT INTO admin_profiles (user_id, first_name, last_name, access_level, can_approve_campaigns, can_manage_users, can_manage_finances, is_active)
      VALUES ($1, 'Admin', 'User', $2, true, true, true, true)
      RETURNING *
    `, [userId, accessLevel]);
    }
    async getAllAdmins() {
        return this.queryMany(`
      SELECT a.id, a.user_id, a.first_name, a.last_name, a.access_level, a.is_active, u.email
      FROM admin_profiles a
      JOIN users u ON a.user_id = u.id
      WHERE a.access_level IN ('admin', 'super_admin')
    `);
    }
    async isUserAdmin(userId) {
        const result = await this.queryOne(`SELECT id FROM admin_profiles WHERE user_id = $1`, [userId]);
        return !!result;
    }
    async deleteAdminProfile(adminId) {
        return this.queryOne(`DELETE FROM admin_profiles WHERE id = $1 RETURNING *`, [adminId]);
    }
    async softDeleteUser(userId) {
        return this.queryOne(`UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`, [userId]);
    }
    async hardDeleteCampaign(campaignId) {
        return this.queryOne(`DELETE FROM campaigns WHERE id = $1 RETURNING *`, [campaignId]);
    }
    async findPendingCampaigns(queryDto) {
        const { page = 1, limit = 10, campaignType, status, sortBy = 'created_at', sortOrder = 'DESC', q } = queryDto;
        const offset = (page - 1) * limit;
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        const targetStatus = status || 'pending_review';
        conditions.push(`c.status = $${paramIndex}`);
        params.push(targetStatus);
        paramIndex++;
        if (campaignType) {
            conditions.push(`c.campaign_type = $${paramIndex}`);
            params.push(campaignType);
            paramIndex++;
        }
        if (q) {
            conditions.push(`(c.title ILIKE $${paramIndex} OR ep.first_name ILIKE $${paramIndex} OR ep.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
            params.push(`%${q}%`);
            paramIndex++;
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const allowedSortFields = ['created_at', 'goal_amount', 'title', 'status'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
        const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
        const dataQuery = `
      SELECT c.id, c.title, c.status, c.goal_amount, c.current_amount, c.created_at, c.campaign_type,
             COALESCE(ep.first_name || ' ' || ep.last_name, u.email) as entrepreneur_name,
             u.email as creator_email
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      LEFT JOIN entrepreneur_profiles ep ON c.creator_id = ep.user_id
      ${whereClause}
      ORDER BY c.${safeSortBy} ${safeSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
        const countQuery = `
      SELECT COUNT(*) as count
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      LEFT JOIN entrepreneur_profiles ep ON c.creator_id = ep.user_id
      ${whereClause}
    `;
        const [dataRows, countRow] = await Promise.all([
            this.queryMany(dataQuery, [...params, limit, offset]),
            this.queryOne(countQuery, params),
        ]);
        const totalItems = parseInt(countRow.count, 10);
        const totalPages = Math.ceil(totalItems / limit);
        return {
            data: dataRows.map(row => ({
                ...row,
                goal_amount: parseFloat(row.goal_amount),
                current_amount: parseFloat(row.current_amount),
            })),
            meta: {
                totalItems,
                itemCount: dataRows.length,
                itemsPerPage: limit,
                totalPages,
                currentPage: page,
            },
        };
    }
    async getCampaignDetailAdmin(id) {
        const query = `
      SELECT c.*, 
             u.email as entrepreneur_email,
             ep.first_name as entrepreneur_first_name,
             ep.last_name as entrepreneur_last_name,
             COALESCE(ep.first_name || ' ' || ep.last_name, u.email) as entrepreneur_name,
             ep.avatar_url as entrepreneur_avatar,
             ep.bio as entrepreneur_bio,
             ep.linkedin_url as entrepreneur_linkedin,
             ep.website as entrepreneur_website,
             cat.display_name as category_name
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      LEFT JOIN entrepreneur_profiles ep ON c.creator_id = ep.user_id
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = $1
    `;
        const campaign = await this.queryOne(query, [id]);
        if (!campaign)
            return null;
        let rewardTiers = [];
        try {
            rewardTiers = await this.queryMany(`SELECT * FROM reward_tiers WHERE campaign_id = $1 ORDER BY amount ASC`, [id]);
        }
        catch (e) {
            console.warn('Could not fetch reward tiers or table missing:', e);
        }
        return {
            ...campaign,
            goal_amount: campaign.goal_amount?.toString() || '0',
            current_amount: parseFloat(campaign.current_amount || 0),
            investor_count: parseInt(campaign.investor_count || 0, 10),
            min_investment: parseFloat(campaign.min_investment || 0),
            max_investment: campaign.max_investment ? parseFloat(campaign.max_investment) : null,
            media: [],
            reward_tiers: rewardTiers.map(t => ({
                ...t,
                amount: parseFloat(t.amount || 0),
            })),
        };
    }
};
exports.AdminRepository = AdminRepository;
exports.AdminRepository = AdminRepository = __decorate([
    (0, common_1.Injectable)()
], AdminRepository);
//# sourceMappingURL=admin.repository.js.map