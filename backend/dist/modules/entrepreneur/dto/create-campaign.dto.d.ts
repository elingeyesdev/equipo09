export declare class CreateCampaignDto {
    title: string;
    description: string;
    shortDescription?: string;
    goalAmount: number;
    campaignType?: 'donation' | 'reward' | 'equity';
    endDate?: string;
    categoryIds?: string[];
    rewards?: any[];
    videoUrl?: string;
}
