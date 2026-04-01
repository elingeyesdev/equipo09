"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRowToCategory = mapRowToCategory;
function mapRowToCategory(row) {
    return {
        id: row.id,
        name: row.name,
        displayName: row.display_name,
        description: row.description,
        icon: row.icon,
        color: row.color,
        slug: row.slug,
        sortOrder: Number(row.sort_order),
        isActive: row.is_active,
        campaignCount: Number(row.campaign_count),
        createdAt: row.created_at,
    };
}
//# sourceMappingURL=category.model.js.map