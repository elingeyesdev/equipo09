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
    categoryId?: string;
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
export interface PublicCampaign {
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    campaignType: 'donation' | 'reward' | 'equity';
    status: string;
    goalAmount: number;
    currentAmount: number;
    investorCount: number;
    coverImageUrl: string | null;
    endDate: Date | null;
    createdAt: Date;
    entrepreneurName: string;
    entrepreneurDisplayName: string | null;
    entrepreneurAvatar: string | null;
    categoryName: string;
    categorySlug: string;
}
export interface PublicCampaignDetail extends PublicCampaign {
    description: string;
    subtitle: string | null;
    currency: string;
    startDate: Date | null;
    minInvestment: number;
    maxInvestment: number | null;
    entrepreneurBio: string | null;
}
export interface QueryPublicCampaignsDto {
    page?: number;
    limit?: number;
    categoryId?: string;
    campaignType?: string;
    q?: string;
    sortBy?: 'created_at' | 'current_amount' | 'goal_amount' | 'end_date';
    sortOrder?: 'ASC' | 'DESC';
}
