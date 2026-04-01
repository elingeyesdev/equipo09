export type InvestorType = 'individual' | 'institutional' | 'angel';
export declare class CreateInvestorProfileDto {
    firstName: string;
    lastName: string;
    displayName?: string;
    bio?: string;
    investorType?: InvestorType;
    taxId?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    preferredCategories?: string[];
    minInvestment?: number;
    maxInvestment?: number;
}
