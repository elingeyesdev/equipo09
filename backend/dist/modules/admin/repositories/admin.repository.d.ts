import { BaseRepository } from '../../../common/database';
export declare class AdminRepository extends BaseRepository {
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalCampaigns: number;
        totalFunded: number;
    }>;
    getAllUsers(): Promise<any[]>;
    getAllCampaigns(): Promise<any[]>;
    updateCampaignStatus(campaignId: string, status: string): Promise<any>;
    createAdminProfile(userId: string, accessLevel: string): Promise<any>;
    getAllAdmins(): Promise<any[]>;
    isUserAdmin(userId: string): Promise<boolean>;
    deleteAdminProfile(adminId: string): Promise<any>;
    softDeleteUser(userId: string): Promise<any>;
    hardDeleteCampaign(campaignId: string): Promise<any>;
}
