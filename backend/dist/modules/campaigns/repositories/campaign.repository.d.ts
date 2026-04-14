import { Pool } from 'pg';
import { EntrepreneurCampaign, CreateCampaignDto } from '../models';
export interface PaginatedCampaigns {
    data: EntrepreneurCampaign[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}
export declare class CampaignRepository {
    private readonly pool;
    constructor(pool: Pool);
    private mapRowToCampaign;
    create(userId: string, dto: CreateCampaignDto): Promise<EntrepreneurCampaign>;
    findByCreatorId(userId: string, page?: number, limit?: number, sortBy?: string, sortOrder?: string): Promise<PaginatedCampaigns>;
    findByIdAndCreator(id: string, creatorId: string): Promise<EntrepreneurCampaign | null>;
    private readonly PUBLIC_STATUSES;
    private readonly PUBLIC_SELECT;
    private mapRowToPublicCampaign;
    findPublicCampaigns(page?: number, limit?: number, sortBy?: string, sortOrder?: string, categoryId?: string, campaignType?: string, search?: string): Promise<PaginatedCampaigns>;
    findPublicById(id: string): Promise<any | null>;
}
