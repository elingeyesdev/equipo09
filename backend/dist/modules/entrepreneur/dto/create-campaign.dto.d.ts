export declare enum CampaignType {
    DONATION = "donation",
    REWARD = "reward",
    EQUITY = "equity"
}
export declare class CreateCampaignDto {
    title: string;
    description: string;
    shortDescription?: string;
    goalAmount: number;
    campaignType: CampaignType;
    endDate?: string;
    categoryId?: string;
    rewards?: any[];
}
