import { AdminService } from '../services/admin.service';
import { ApiSuccessResponse } from '../../../common/dto';
import { QueryAdminCampaignsDto } from '../dto/admin-campaigns.dto';
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
    getPendingCampaigns(query: QueryAdminCampaignsDto): Promise<ApiSuccessResponse<{
        data: any[];
        meta: {
            totalItems: number;
            itemCount: number;
            itemsPerPage: number;
            totalPages: number;
            currentPage: number;
        };
    }>>;
    getCampaignDetail(id: string): Promise<ApiSuccessResponse<any>>;
    getCampaignHistory(id: string): Promise<ApiSuccessResponse<any[]>>;
    getCampaignFinancialProgress(id: string): Promise<ApiSuccessResponse<import("../../entrepreneur/models").CampaignFinancialProgress | null>>;
    updateCampaignStatus(id: string, status: string, feedback: string | undefined, req: any): Promise<ApiSuccessResponse<any>>;
    softDeleteUser(id: string): Promise<ApiSuccessResponse<any>>;
    getCampaignInvestors(id: string, page?: number, limit?: number): Promise<ApiSuccessResponse<import("../../../common/dto").PaginatedResponse<import("../../entrepreneur/models").CampaignInvestor>>>;
    getRewardClaims(id: string): Promise<ApiSuccessResponse<any[]>>;
    deleteCampaign(id: string, req: any): Promise<ApiSuccessResponse<any>>;
}
