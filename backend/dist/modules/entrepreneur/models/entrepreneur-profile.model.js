"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRowToEntrepreneurProfile = mapRowToEntrepreneurProfile;
function mapRowToEntrepreneurProfile(row) {
    return {
        id: row.id,
        userId: row.user_id,
        firstName: row.first_name,
        lastName: row.last_name,
        displayName: row.display_name,
        bio: row.bio,
        companyName: row.company_name,
        website: row.website,
        linkedinUrl: row.linkedin_url,
        addressLine: row.address_line,
        city: row.city,
        state: row.state,
        country: row.country,
        postalCode: row.postal_code,
        bankAccountNumber: row.bank_account_number,
        bankName: row.bank_name,
        avatarUrl: row.avatar_url,
        coverUrl: row.cover_url,
        identityVerified: row.identity_verified,
        identityVerifiedAt: row.identity_verified_at,
        verificationDocuments: row.verification_documents ?? [],
        totalCampaigns: Number(row.total_campaigns),
        totalRaised: Number(row.total_raised),
        rating: row.rating ? Number(row.rating) : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
//# sourceMappingURL=entrepreneur-profile.model.js.map