export interface User {
    id: string;
    email: string;
    phone: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    isActive: boolean;
    avatarUrl: string | null;
    preferredLanguage: string;
    timezone: string;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    roles?: string[];
    adminAccessLevel?: string;
}
export declare function mapRowToUser(row: Record<string, any>): User;
