"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRowToEntrepreneurCampaign = mapRowToEntrepreneurCampaign;
const reward_tier_model_1 = require("../../reward-tiers/models/reward-tier.model");
function mapRowToEntrepreneurCampaign(row) {
    const campaign = {
        id: row.id,
        title: row.title,
        slug: row.slug,
        shortDescription: row.short_description,
        campaignType: row.campaign_type,
        status: row.status,
        goalAmount: Number(row.goal_amount),
        currentAmount: Number(row.current_amount),
        investorCount: Number(row.investor_count),
        currency: row.currency,
        coverImageUrl: row.cover_image_url,
        startDate: row.start_date,
        endDate: row.end_date,
        fundedAt: row.funded_at,
        isFeatured: row.is_featured,
        viewCount: Number(row.view_count),
        categoryName: row.category_name,
        categorySlug: row.category_slug,
        categoryId: row.category_id,
        description: row.description,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        publishedAt: row.published_at,
    };
    if (row.reward_tiers) {
        campaign.rewardTiers = row.reward_tiers.map(reward_tier_model_1.mapRowToRewardTier);
    }
    return campaign;
}
//# sourceMappingURL=campaign.model.js.map