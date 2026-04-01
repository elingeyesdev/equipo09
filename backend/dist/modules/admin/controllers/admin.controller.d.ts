import { AdminService } from '../services/admin.service';
import { ApiSuccessResponse } from '../../../common/dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboardStats(): Promise<ApiSuccessResponse<{
        totalUsers: number;
        totalCampaigns: number;
        totalFunded: number;
    }>>;
    getAllUsers(): Promise<ApiSuccessResponse<any[]>>;
    getAllCampaigns(): Promise<ApiSuccessResponse<any[]>>;
    updateCampaignStatus(id: string, status: string): Promise<ApiSuccessResponse<any>>;
    softDeleteUser(id: string): Promise<ApiSuccessResponse<any>>;
    deleteCampaign(id: string): Promise<ApiSuccessResponse<any>>;
}
