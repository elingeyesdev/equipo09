import { PaginatedResponse } from '../../../common/dto';
import { EntrepreneurProfileRepository, EntrepreneurCampaignRepository } from '../repositories';
import { UserRepository } from '../../users/repositories';
import { CreateEntrepreneurProfileDto, UpdateEntrepreneurProfileDto, QueryCampaignsDto, CreateCampaignDto } from '../dto';
import { EntrepreneurProfile, EntrepreneurCampaign, CampaignFinancialProgress, EntrepreneurFinancialSummary, CampaignCreationReadiness, CampaignInvestor } from '../models';
export declare class EntrepreneurService {
    private readonly profileRepo;
    private readonly campaignRepo;
    private readonly userRepo;
    private readonly logger;
    constructor(profileRepo: EntrepreneurProfileRepository, campaignRepo: EntrepreneurCampaignRepository, userRepo: UserRepository);
    createProfile(userId: string, dto: CreateEntrepreneurProfileDto): Promise<EntrepreneurProfile>;
    deleteMyProfile(userId: string): Promise<void>;
    getMyProfile(userId: string): Promise<EntrepreneurProfile>;
    getProfileById(profileId: string): Promise<EntrepreneurProfile>;
    updateMyProfile(userId: string, dto: UpdateEntrepreneurProfileDto): Promise<EntrepreneurProfile>;
    updateProfile(profileId: string, requestingUserId: string, dto: UpdateEntrepreneurProfileDto): Promise<EntrepreneurProfile>;
    getMyCampaigns(userId: string, query: QueryCampaignsDto): Promise<PaginatedResponse<EntrepreneurCampaign>>;
    createCampaign(userId: string, dto: CreateCampaignDto): Promise<EntrepreneurCampaign>;
    getMyCampaignById(userId: string, campaignId: string): Promise<EntrepreneurCampaign>;
    submitCampaignForReview(userId: string, campaignId: string): Promise<EntrepreneurCampaign>;
    publishCampaign(userId: string, campaignId: string): Promise<EntrepreneurCampaign>;
    updateCampaignCover(userId: string, campaignId: string, coverUrl: string): Promise<EntrepreneurCampaign>;
    updateCampaign(userId: string, campaignId: string, dto: Partial<CreateCampaignDto>): Promise<EntrepreneurCampaign>;
    getCampaignHistory(userId: string, campaignId: string): Promise<any[]>;
    getCampaignCreationReadiness(userId: string): Promise<CampaignCreationReadiness>;
    getCampaignFinancialProgress(userId: string, campaignId: string): Promise<CampaignFinancialProgress>;
    getCampaignInvestors(userId: string, campaignId: string, query: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<CampaignInvestor>>;
    getMyFinancialSummary(userId: string): Promise<EntrepreneurFinancialSummary>;
    private ensureEntrepreneurProfile;
    private ensureProfileCompleteForNewCampaign;
    deleteCampaign(userId: string, campaignId: string): Promise<boolean>;
    finalizeCampaign(userId: string, campaignId: string): Promise<EntrepreneurCampaign>;
}
