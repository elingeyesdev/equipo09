export interface InvestorProfile {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    displayName: string | null;
    bio: string | null;
    investorType: 'individual' | 'institutional' | 'angel';
    accredited: boolean;
    taxId: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    preferredCategories: string[];
    minInvestment: number | null;
    maxInvestment: number | null;
    identityVerified: boolean;
    identityVerifiedAt: Date | null;
    verificationDocuments: any[];
    totalInvestments: number;
    totalInvested: number;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare function mapRowToInvestorProfile(row: any): InvestorProfile;
