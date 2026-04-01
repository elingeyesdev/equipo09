import { AdminService } from '../services/admin.service';
import { ApiSuccessResponse } from '../../../common/dto';
import { CreateAdminDto } from '../dto/create-admin.dto';
export declare class SuperAdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createAdmin(dto: CreateAdminDto): Promise<ApiSuccessResponse<any>>;
    getAllAdmins(): Promise<ApiSuccessResponse<any[]>>;
    deleteAdmin(id: string): Promise<ApiSuccessResponse<any>>;
}
