"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRowToInvestorProfile = mapRowToInvestorProfile;
function mapRowToInvestorProfile(row) {
    return {
        id: row.id,
        userId: row.user_id,
        firstName: row.first_name,
        lastName: row.last_name,
        displayName: row.display_name,
        bio: row.bio,
        investorType: row.investor_type,
        accredited: row.accredited,
        taxId: row.tax_id,
        addressLine1: row.address_line1,
        addressLine2: row.address_line2,
        city: row.city,
        state: row.state,
        country: row.country,
        postalCode: row.postal_code,
        preferredCategories: row.preferred_categories ?? [],
        minInvestment: row.min_investment ? Number(row.min_investment) : null,
        maxInvestment: row.max_investment ? Number(row.max_investment) : null,
        identityVerified: row.identity_verified,
        identityVerifiedAt: row.identity_verified_at,
        verificationDocuments: row.verification_documents ?? [],
        totalInvestments: Number(row.total_investments),
        totalInvested: Number(row.total_invested),
        metadata: row.metadata ?? {},
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
//# sourceMappingURL=investor-profile.model.js.map