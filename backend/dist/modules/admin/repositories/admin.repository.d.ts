import { BaseRepository } from '../../../common/database';
import { QueryAdminCampaignsDto } from '../dto/admin-campaigns.dto';
export declare class AdminRepository extends BaseRepository {
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalCampaigns: number;
        totalFunded: number;
    }>;
    getAllUsers(): Promise<any[]>;
    getAllCampaigns(): Promise<any[]>;
    updateCampaignStatus(campaignId: string, status: string, reviewerId: string, feedback?: string): Promise<any>;
    getCampaignHistory(campaignId: string): Promise<any[]>;
    createAdminProfile(userId: string, accessLevel: string): Promise<any>;
    getAllAdmins(): Promise<any[]>;
    isUserAdmin(userId: string): Promise<boolean>;
    deleteAdminProfile(adminId: string): Promise<any>;
    softDeleteUser(userId: string): Promise<any>;
    hardDeleteCampaign(campaignId: string): Promise<any>;
    findPendingCampaigns(queryDto: QueryAdminCampaignsDto): Promise<{
        data: any[];
        meta: {
            totalItems: number;
            itemCount: number;
            itemsPerPage: number;
            totalPages: number;
            currentPage: number;
        };
    }>;
    getCampaignDetailAdmin(id: string): Promise<any>;
}
