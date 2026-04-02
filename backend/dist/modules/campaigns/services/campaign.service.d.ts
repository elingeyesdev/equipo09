import { CampaignRepository, PaginatedCampaigns } from '../repositories';
import { EntrepreneurCampaign, CreateCampaignDto, QueryCampaignsDto } from '../models';
export declare class CampaignService {
    private readonly campaignRepo;
    constructor(campaignRepo: CampaignRepository);
    createCampaign(creatorId: string, dto: CreateCampaignDto): Promise<EntrepreneurCampaign>;
    getMyCampaigns(creatorId: string, query: QueryCampaignsDto): Promise<PaginatedCampaigns>;
    getCampaignById(campaignId: string, creatorId: string): Promise<EntrepreneurCampaign>;
}
