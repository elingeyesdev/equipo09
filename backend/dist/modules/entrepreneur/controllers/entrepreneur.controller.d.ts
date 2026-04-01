import { Request } from 'express';
import { EntrepreneurService } from '../services';
import { CreateEntrepreneurProfileDto, UpdateEntrepreneurProfileDto, QueryCampaignsDto, CreateCampaignDto } from '../dto';
import { ApiSuccessResponse, PaginatedResponse } from '../../../common/dto';
import { EntrepreneurProfile, EntrepreneurCampaign, CampaignFinancialProgress, EntrepreneurFinancialSummary } from '../models';
export declare class EntrepreneurController {
    private readonly entrepreneurService;
    constructor(entrepreneurService: EntrepreneurService);
    createProfile(req: Request, dto: CreateEntrepreneurProfileDto): Promise<ApiSuccessResponse<EntrepreneurProfile>>;
    getMyProfile(req: Request): Promise<ApiSuccessResponse<EntrepreneurProfile>>;
    updateMyProfile(req: Request, dto: UpdateEntrepreneurProfileDto): Promise<ApiSuccessResponse<EntrepreneurProfile>>;
    getProfileById(id: string): Promise<ApiSuccessResponse<EntrepreneurProfile>>;
    createCampaign(req: Request, dto: CreateCampaignDto): Promise<ApiSuccessResponse<EntrepreneurCampaign>>;
    getMyCampaigns(req: Request, query: QueryCampaignsDto): Promise<ApiSuccessResponse<PaginatedResponse<EntrepreneurCampaign>>>;
    getMyCampaignById(req: Request, campaignId: string): Promise<ApiSuccessResponse<EntrepreneurCampaign>>;
    getMyFinancialSummary(req: Request): Promise<ApiSuccessResponse<EntrepreneurFinancialSummary>>;
    getCampaignFinancialProgress(req: Request, campaignId: string): Promise<ApiSuccessResponse<CampaignFinancialProgress>>;
}
