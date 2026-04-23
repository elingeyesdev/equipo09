import { Request } from 'express';
import { EntrepreneurService } from '../services';
import { CreateEntrepreneurProfileDto, UpdateEntrepreneurProfileDto, QueryCampaignsDto, CreateCampaignDto } from '../dto';
import { ApiSuccessResponse, PaginatedResponse } from '../../../common/dto';
import { EntrepreneurProfile, EntrepreneurCampaign, CampaignFinancialProgress, EntrepreneurFinancialSummary, CampaignCreationReadiness } from '../models';
export declare class EntrepreneurController {
    private readonly entrepreneurService;
    constructor(entrepreneurService: EntrepreneurService);
    createProfile(req: Request, dto: CreateEntrepreneurProfileDto): Promise<ApiSuccessResponse<EntrepreneurProfile>>;
    getMyProfile(req: Request): Promise<ApiSuccessResponse<EntrepreneurProfile>>;
    getCampaignReadiness(req: Request): Promise<ApiSuccessResponse<CampaignCreationReadiness>>;
    updateMyProfile(req: Request, dto: UpdateEntrepreneurProfileDto): Promise<ApiSuccessResponse<EntrepreneurProfile>>;
    deleteMyProfile(req: Request): Promise<ApiSuccessResponse<null>>;
    getProfileById(id: string): Promise<ApiSuccessResponse<EntrepreneurProfile>>;
    uploadAvatar(req: Request, file: Express.Multer.File): Promise<ApiSuccessResponse<EntrepreneurProfile>>;
    uploadCover(req: Request, file: Express.Multer.File): Promise<ApiSuccessResponse<EntrepreneurProfile>>;
    createCampaign(req: Request, dto: CreateCampaignDto): Promise<ApiSuccessResponse<EntrepreneurCampaign>>;
    updateCampaign(req: Request, campaignId: string, dto: Partial<CreateCampaignDto>): Promise<ApiSuccessResponse<EntrepreneurCampaign>>;
    getMyCampaigns(req: Request, query: QueryCampaignsDto): Promise<ApiSuccessResponse<PaginatedResponse<EntrepreneurCampaign>>>;
    submitCampaignForReview(req: Request, campaignId: string): Promise<ApiSuccessResponse<EntrepreneurCampaign>>;
    getCampaignHistory(req: Request, campaignId: string): Promise<ApiSuccessResponse<any[]>>;
    publishCampaign(req: Request, campaignId: string): Promise<ApiSuccessResponse<EntrepreneurCampaign>>;
    uploadCampaignCover(req: Request, campaignId: string, file: Express.Multer.File): Promise<ApiSuccessResponse<EntrepreneurCampaign>>;
    getMyCampaignById(req: Request, campaignId: string): Promise<ApiSuccessResponse<EntrepreneurCampaign>>;
    getMyFinancialSummary(req: Request): Promise<ApiSuccessResponse<EntrepreneurFinancialSummary>>;
    getCampaignFinancialProgress(req: Request, campaignId: string): Promise<ApiSuccessResponse<CampaignFinancialProgress>>;
}
