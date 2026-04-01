import { BaseRepository } from '../../../common/database';
import { EntrepreneurCampaign, CampaignFinancialProgress, EntrepreneurFinancialSummary } from '../models';
import { QueryCampaignsDto, CreateCampaignDto } from '../dto';
export declare class EntrepreneurCampaignRepository extends BaseRepository {
    create(creatorId: string, dto: CreateCampaignDto): Promise<EntrepreneurCampaign>;
    findByCreatorId(creatorId: string, query: QueryCampaignsDto): Promise<{
        campaigns: EntrepreneurCampaign[];
        total: number;
    }>;
    findOneByCreatorId(campaignId: string, creatorId: string): Promise<EntrepreneurCampaign | null>;
    getFinancialProgress(campaignId: string, creatorId: string): Promise<CampaignFinancialProgress | null>;
    getFinancialSummary(creatorId: string): Promise<EntrepreneurFinancialSummary>;
}
