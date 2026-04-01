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
    async updateCampaignStatus(campaignId, status) {
        return this.queryOne(`
      UPDATE campaigns 
      SET status = $2, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `, [campaignId, status]);
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
};
exports.AdminRepository = AdminRepository;
exports.AdminRepository = AdminRepository = __decorate([
    (0, common_1.Injectable)()
], AdminRepository);
//# sourceMappingURL=admin.repository.js.map