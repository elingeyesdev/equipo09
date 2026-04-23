import { AdminRepository } from '../repositories/admin.repository';
import { UserRepository } from '../../users/repositories';
import { EntrepreneurCampaignRepository } from '../../entrepreneur/repositories';
import { QueryAdminCampaignsDto } from '../dto/admin-campaigns.dto';
export declare class AdminService {
    private readonly adminRepo;
    private readonly userRepo;
    private readonly campaignRepo;
    constructor(adminRepo: AdminRepository, userRepo: UserRepository, campaignRepo: EntrepreneurCampaignRepository);
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
    createAdmin(email: string, passwordString: string): Promise<any>;
    getAllAdmins(): Promise<any[]>;
    deleteAdminProfile(adminId: string): Promise<any>;
    softDeleteUser(userId: string): Promise<any>;
    hardDeleteCampaign(campaignId: string, reviewerId: string): Promise<any>;
}
