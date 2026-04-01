"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRowToUser = mapRowToUser;
function mapRowToUser(row) {
    return {
        id: row.id,
        email: row.email,
        phone: row.phone ?? null,
        emailVerified: row.email_verified,
        phoneVerified: row.phone_verified,
        isActive: row.is_active,
        avatarUrl: row.avatar_url ?? null,
        preferredLanguage: row.preferred_language,
        timezone: row.timezone,
        lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        roles: row.roles ?? undefined,
        adminAccessLevel: row.admin_access_level ?? undefined,
    };
}
//# sourceMappingURL=user.model.js.map