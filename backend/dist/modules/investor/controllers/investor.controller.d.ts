import { Request } from 'express';
import { InvestorService } from '../services';
import { CreateInvestorProfileDto, UpdateInvestorProfileDto } from '../dto';
import { ApiSuccessResponse } from '../../../common/dto';
import { InvestorProfile, CapitalOverview } from '../models';
export declare class InvestorController {
    private readonly investorService;
    constructor(investorService: InvestorService);
    createProfile(req: Request, dto: CreateInvestorProfileDto): Promise<ApiSuccessResponse<InvestorProfile>>;
    getMyProfile(req: Request): Promise<ApiSuccessResponse<InvestorProfile>>;
    getCapitalOverview(req: Request): Promise<ApiSuccessResponse<CapitalOverview>>;
    updateMyProfile(req: Request, dto: UpdateInvestorProfileDto): Promise<ApiSuccessResponse<InvestorProfile>>;
    deleteMyProfile(req: Request): Promise<ApiSuccessResponse<null>>;
    getProfileById(id: string): Promise<ApiSuccessResponse<InvestorProfile>>;
    uploadAvatar(req: Request, file: Express.Multer.File): Promise<ApiSuccessResponse<InvestorProfile>>;
    uploadCover(req: Request, file: Express.Multer.File): Promise<ApiSuccessResponse<InvestorProfile>>;
}
