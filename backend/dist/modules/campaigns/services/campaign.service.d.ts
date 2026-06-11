import { CampaignRepository, PaginatedCampaigns } from '../repositories';
import { EntrepreneurCampaign, CreateCampaignDto, QueryCampaignsDto, CampaignFinancialProgress } from '../models';
import { CreateCampaignUpdateDto } from '../dto';
export declare class CampaignService {
    private readonly campaignRepo;
    constructor(campaignRepo: CampaignRepository);
    createCampaign(creatorId: string, dto: CreateCampaignDto): Promise<EntrepreneurCampaign>;
    getMyCampaigns(creatorId: string, query: QueryCampaignsDto): Promise<PaginatedCampaigns>;
    getCampaignById(campaignId: string, creatorId: string): Promise<EntrepreneurCampaign>;
    getPublicCampaigns(query: {
        page?: any;
        limit?: any;
        sortBy?: string;
        sortOrder?: string;
        categoryId?: string;
        campaignType?: string;
        q?: string;
    }): Promise<PaginatedCampaigns>;
    getPublicCampaignById(campaignId: string): Promise<any>;
    getPublicCampaignFinancialProgress(campaignId: string): Promise<CampaignFinancialProgress>;
    incrementViewCount(campaignId: string): Promise<void>;
    createCampaignUpdate(campaignId: string, authorId: string, dto: CreateCampaignUpdateDto): Promise<any>;
    getRecentPublicUpdatesGroupedByCampaign(): Promise<any[]>;
}
