import { PaginatedResponse } from '../../../common/dto';
import { EntrepreneurProfileRepository, EntrepreneurCampaignRepository } from '../repositories';
import { CreateEntrepreneurProfileDto, UpdateEntrepreneurProfileDto, QueryCampaignsDto, CreateCampaignDto } from '../dto';
import { EntrepreneurProfile, EntrepreneurCampaign, CampaignFinancialProgress, EntrepreneurFinancialSummary } from '../models';
export declare class EntrepreneurService {
    private readonly profileRepo;
    private readonly campaignRepo;
    private readonly logger;
    constructor(profileRepo: EntrepreneurProfileRepository, campaignRepo: EntrepreneurCampaignRepository);
    createProfile(userId: string, dto: CreateEntrepreneurProfileDto): Promise<EntrepreneurProfile>;
    getMyProfile(userId: string): Promise<EntrepreneurProfile>;
    getProfileById(profileId: string): Promise<EntrepreneurProfile>;
    updateMyProfile(userId: string, dto: UpdateEntrepreneurProfileDto): Promise<EntrepreneurProfile>;
    updateProfile(profileId: string, requestingUserId: string, dto: UpdateEntrepreneurProfileDto): Promise<EntrepreneurProfile>;
    getMyCampaigns(userId: string, query: QueryCampaignsDto): Promise<PaginatedResponse<EntrepreneurCampaign>>;
    createCampaign(userId: string, dto: CreateCampaignDto): Promise<EntrepreneurCampaign>;
    getMyCampaignById(userId: string, campaignId: string): Promise<EntrepreneurCampaign>;
    submitCampaignForReview(userId: string, campaignId: string): Promise<EntrepreneurCampaign>;
    publishCampaign(userId: string, campaignId: string): Promise<EntrepreneurCampaign>;
    getCampaignFinancialProgress(userId: string, campaignId: string): Promise<CampaignFinancialProgress>;
    getMyFinancialSummary(userId: string): Promise<EntrepreneurFinancialSummary>;
    private ensureEntrepreneurProfile;
}
