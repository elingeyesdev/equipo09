"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRowToEntrepreneurCampaign = mapRowToEntrepreneurCampaign;
function mapRowToEntrepreneurCampaign(row) {
    return {
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
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        publishedAt: row.published_at,
    };
}
//# sourceMappingURL=campaign.model.js.map