import { BaseRepository } from '../../../common/database';
import { EntrepreneurCampaign, CampaignFinancialProgress, EntrepreneurFinancialSummary } from '../models';
import { QueryCampaignsDto } from '../dto';
export declare class EntrepreneurCampaignRepository extends BaseRepository {
    findByCreatorId(creatorId: string, query: QueryCampaignsDto): Promise<{
        campaigns: EntrepreneurCampaign[];
        total: number;
    }>;
    findOneByCreatorId(campaignId: string, creatorId: string): Promise<EntrepreneurCampaign | null>;
    getFinancialProgress(campaignId: string, creatorId: string): Promise<CampaignFinancialProgress | null>;
    getFinancialSummary(creatorId: string): Promise<EntrepreneurFinancialSummary>;
}
