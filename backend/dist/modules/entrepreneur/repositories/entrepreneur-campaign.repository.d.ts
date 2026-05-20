import { BaseRepository } from '../../../common/database';
import { EntrepreneurCampaign, CampaignFinancialProgress, EntrepreneurFinancialSummary, CampaignInvestor } from '../models';
import { QueryCampaignsDto, CreateCampaignDto } from '../dto';
export declare class EntrepreneurCampaignRepository extends BaseRepository {
    create(creatorId: string, dto: CreateCampaignDto): Promise<EntrepreneurCampaign>;
    findByCreatorId(creatorId: string, query: QueryCampaignsDto): Promise<{
        campaigns: EntrepreneurCampaign[];
        total: number;
    }>;
    findOneByCreatorId(campaignId: string, creatorId: string, client?: any): Promise<EntrepreneurCampaign | null>;
    submitForReview(campaignId: string, creatorId: string): Promise<EntrepreneurCampaign | null>;
    publishCampaign(campaignId: string, creatorId: string): Promise<EntrepreneurCampaign | null>;
    validateRewardsSum(campaignId: string): Promise<boolean>;
    updateCoverImageUrl(campaignId: string, creatorId: string, coverImageUrl: string): Promise<EntrepreneurCampaign | null>;
    update(campaignId: string, creatorId: string, dto: Partial<CreateCampaignDto>): Promise<EntrepreneurCampaign | null>;
    getFinancialProgress(campaignId: string, creatorId: string): Promise<CampaignFinancialProgress | null>;
    getFinancialProgressAdmin(campaignId: string): Promise<CampaignFinancialProgress | null>;
    private getFinancialProgressShared;
    getFinancialSummary(creatorId: string): Promise<EntrepreneurFinancialSummary>;
    getHistory(campaignId: string): Promise<any[]>;
    getCampaignInvestors(campaignId: string, creatorId: string, query?: {
        page?: number;
        limit?: number;
    }): Promise<{
        investors: CampaignInvestor[];
        total: number;
    }>;
    delete(campaignId: string, creatorId: string): Promise<boolean>;
    finalize(campaignId: string, creatorId: string): Promise<EntrepreneurCampaign | null>;
    insertCampaignDocument(campaignId: string, documentUrl: string, originalName: string, mimeType: string, fileSizeBytes: number, justification: string): Promise<any>;
    findCampaignDocuments(campaignId: string): Promise<any[]>;
    findCampaignDocumentById(campaignId: string, docId: string): Promise<any>;
    deleteCampaignDocument(docId: string): Promise<void>;
}
