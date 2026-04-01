import { AdminRepository } from '../repositories/admin.repository';
import { UserRepository } from '../../users/repositories';
export declare class AdminService {
    private readonly adminRepo;
    private readonly userRepo;
    constructor(adminRepo: AdminRepository, userRepo: UserRepository);
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalCampaigns: number;
        totalFunded: number;
    }>;
    getAllUsers(): Promise<any[]>;
    getAllCampaigns(): Promise<any[]>;
    updateCampaignStatus(campaignId: string, status: string): Promise<any>;
    createAdmin(email: string, passwordString: string): Promise<any>;
    getAllAdmins(): Promise<any[]>;
    deleteAdminProfile(adminId: string): Promise<any>;
    softDeleteUser(userId: string): Promise<any>;
    hardDeleteCampaign(campaignId: string): Promise<any>;
}
