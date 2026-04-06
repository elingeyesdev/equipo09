export interface EntrepreneurProfile {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    displayName: string | null;
    bio: string | null;
    companyName: string | null;
    website: string | null;
    linkedinUrl: string | null;
    addressLine: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    bankAccountNumber: string | null;
    bankName: string | null;
    avatarUrl: string | null;
    coverUrl: string | null;
    identityVerified: boolean;
    identityVerifiedAt: Date | null;
    verificationDocuments: any[];
    totalCampaigns: number;
    totalRaised: number;
    rating: number | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare function mapRowToEntrepreneurProfile(row: any): EntrepreneurProfile;
