import { PaginatedResponse } from '../../../common/dto';
import { AdminRepository } from '../repositories/admin.repository';
import { UserRepository } from '../../users/repositories';
import { EntrepreneurCampaignRepository } from '../../entrepreneur/repositories';
import { RewardTierRepository } from '../../reward-tiers/repositories/reward-tier.repository';
import { QueryAdminCampaignsDto } from '../dto/admin-campaigns.dto';
export declare class AdminService {
    private readonly adminRepo;
    private readonly userRepo;
    private readonly campaignRepo;
    private readonly rewardRepo;
    constructor(adminRepo: AdminRepository, userRepo: UserRepository, campaignRepo: EntrepreneurCampaignRepository, rewardRepo: RewardTierRepository);
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalCampaigns: number;
        totalFunded: number;
    }>;
    getAllUsers(): Promise<any[]>;
    getAllCampaigns(): Promise<any[]>;
    getPendingCampaigns(queryDto: QueryAdminCampaignsDto): Promise<{
        data: any[];
        meta: {
            totalItems: number;
            itemCount: number;
            itemsPerPage: number;
            totalPages: number;
            currentPage: number;
        };
    }>;
    getCampaignDetail(id: string): Promise<any>;
    updateCampaignStatus(campaignId: string, status: string, reviewerId: string, feedback?: string): Promise<any>;
    getCampaignHistory(campaignId: string): Promise<any[]>;
    getCampaignFinancialProgress(campaignId: string): Promise<import("../../entrepreneur/models").CampaignFinancialProgress | null>;
    getCampaignInvestors(campaignId: string, query: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<import("../../entrepreneur/models").CampaignInvestor>>;
    getRewardClaims(campaignId: string): Promise<any[]>;
    createAdmin(email: string, passwordString: string): Promise<any>;
    getAllAdmins(): Promise<any[]>;
    deleteAdminProfile(adminId: string): Promise<any>;
    softDeleteUser(userId: string): Promise<any>;
    hardDeleteCampaign(campaignId: string, reviewerId: string): Promise<any>;
}
