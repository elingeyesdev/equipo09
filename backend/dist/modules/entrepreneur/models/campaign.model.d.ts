import { RewardTier } from '../../reward-tiers/models/reward-tier.model';
export interface EntrepreneurCampaign {
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    campaignType: string;
    status: string;
    goalAmount: number;
    currentAmount: number;
    investorCount: number;
    currency: string;
    coverImageUrl: string | null;
    startDate: Date | null;
    endDate: Date | null;
    fundedAt: Date | null;
    isFeatured: boolean;
    viewCount: number;
    categoryName: string;
    categorySlug: string;
    categoryId: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
    rewardTiers?: RewardTier[];
}
export interface CampaignFinancialProgress {
    campaignId: string;
    title: string;
    slug: string;
    status: string;
    goalAmount: number;
    currentAmount: number;
    remainingAmount: number;
    fundingPercentage: number;
    investorCount: number;
    currency: string;
    startDate: Date | null;
    endDate: Date | null;
    daysRemaining: number | null;
    fundedAt: Date | null;
    investments: {
        total: number;
        completed: number;
        pending: number;
        failed: number;
        refunded: number;
    };
    amounts: {
        confirmed: number;
        pending: number;
        refunded: number;
    };
    averageInvestment: number;
    largestInvestment: number;
    smallestInvestment: number;
    recentInvestments: RecentInvestment[];
}
export interface RecentInvestment {
    id: string;
    amount: number;
    currency: string;
    status: string;
    isAnonymous: boolean;
    investorDisplayName: string | null;
    rewardTitle?: string;
    createdAt: Date;
}
export interface EntrepreneurFinancialSummary {
    totalCampaigns: number;
    activeCampaigns: number;
    fundedCampaigns: number;
    totalRaised: number;
    totalInvestors: number;
    averagePerCampaign: number;
    currency: string;
}
export interface CampaignInvestor {
    userId: string;
    firstName: string;
    lastName: string;
    displayName: string | null;
    avatarUrl: string | null;
    location: string | null;
    bio: string | null;
    email: string;
    totalInvested: number;
    investmentCount: number;
    lastInvestmentAt: Date;
    investmentId?: string;
    rewardTitle?: string;
}
export declare function mapRowToEntrepreneurCampaign(row: any): EntrepreneurCampaign;
