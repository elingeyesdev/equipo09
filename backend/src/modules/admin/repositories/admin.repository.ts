import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/database';

@Injectable()
export class AdminRepository extends BaseRepository {
  /**
   * Obtiene un resumen de las campañas y usuarios.
   */
  async getDashboardStats() {
    const usersCount = await this.queryOne(`SELECT COUNT(*) as count FROM users`);
    const campaignsCount = await this.queryOne(`SELECT COUNT(*) as count FROM campaigns`);
    const totalCurrentAmount = await this.queryOne(`SELECT COALESCE(SUM(current_amount), 0) as total FROM campaigns`);

    return {
      totalUsers: parseInt(usersCount!.count, 10),
      totalCampaigns: parseInt(campaignsCount!.count, 10),
      totalFunded: parseFloat(totalCurrentAmount!.total),
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

  async updateCampaignStatus(campaignId: string, status: string) {
    return this.queryOne(`
      UPDATE campaigns 
      SET status = $2, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `, [campaignId, status]);
  }

  async createAdminProfile(userId: string, accessLevel: string) {
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

  async isUserAdmin(userId: string): Promise<boolean> {
    const result = await this.queryOne(`SELECT id FROM admin_profiles WHERE user_id = $1`, [userId]);
    return !!result;
  }

  async deleteAdminProfile(adminId: string) {
    return this.queryOne(`DELETE FROM admin_profiles WHERE id = $1 RETURNING *`, [adminId]);
  }

  async softDeleteUser(userId: string) {
    // Soft Delete the user, preventing further logins
    return this.queryOne(`UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`, [userId]);
  }

  async hardDeleteCampaign(campaignId: string) {
    // If it fails due to foreign key constraints, pg driver will throw an exception
    return this.queryOne(`DELETE FROM campaigns WHERE id = $1 RETURNING *`, [campaignId]);
  }
}
