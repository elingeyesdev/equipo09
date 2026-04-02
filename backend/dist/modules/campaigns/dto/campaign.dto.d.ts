export declare class CreateCampaignDto {
    title: string;
    description: string;
    shortDescription?: string;
    categoryId: string;
    goalAmount: number;
    campaignType: 'donation' | 'reward' | 'equity';
    startDate?: string;
    endDate?: string;
}
export declare class QueryCampaignsDto {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    status?: string;
    q?: string;
    categoryId?: string;
}
