export interface EntrepreneurCampaign {
    id: string;
    creatorId: string;
    categoryId: string;
    title: string;
    slug: string;
    subtitle: string | null;
    description: string;
    shortDescription: string | null;
    campaignType: 'donation' | 'reward' | 'equity';
    status: 'draft' | 'pending_review' | 'active' | 'paused' | 'successful' | 'failed' | 'cancelled';
    goalAmount: number;
    currentAmount: number;
    minInvestment: number;
    maxInvestment: number | null;
    equityPercentage: number | null;
    startDate: Date | null;
    endDate: Date | null;
    fundsRaised: number;
    investorsCount: number;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateCampaignDto {
    title: string;
    description: string;
    shortDescription?: string;
    categoryId: string;
    goalAmount: number;
    campaignType: 'donation' | 'reward' | 'equity';
    endDate?: Date;
}
export interface QueryCampaignsDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    status?: string;
    q?: string;
    categoryId?: string;
}
export interface CampaignFinancialProgress {
    goalAmount: number;
    currentAmount: number;
    progressPercentage: number;
    investorsCount: number;
    daysRemaining: number | null;
}
