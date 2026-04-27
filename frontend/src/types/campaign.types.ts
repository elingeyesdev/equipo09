export type CampaignStatus =
  | 'draft'
  | 'pending_review'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'funded'
  | 'partially_funded'
  | 'failed'
  | 'cancelled'
  | 'completed'
  | 'suspended';

export type CampaignType = 'donation' | 'reward' | 'equity';

export interface EntrepreneurCampaign {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  location: string | null;
  categoryId: string;
  campaignType: CampaignType;
  status: CampaignStatus;
  goalAmount: number;
  currentAmount: number;
  investorCount: number;
  currency: string;
  coverImageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  fundedAt: string | null;
  isFeatured: boolean;
  viewCount: number;
  categoryName: string;
  categorySlug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  rewardTiers?: RewardTier[];
}

export interface CreateCampaignDto {
  title: string;
  description: string;
  shortDescription?: string;
  goalAmount: number;
  campaignType: CampaignType;
  endDate?: string;
  /** Si se omite, el backend asigna una categoría por defecto. Debe ser UUID. */
  categoryId?: string;
  rewards?: CreateRewardTierDto[];
}

export type CampaignFilterPreset =
  | 'all'
  | 'draft'
  | 'approval'
  | 'published'
  | 'archived';

export interface QueryCampaignsDto {
  page?: number;
  limit?: number;
  /** Tiene prioridad sobre filterPreset si ambos se envían */
  status?: CampaignStatus;
  filterPreset?: CampaignFilterPreset;
  campaignType?: CampaignType;
  search?: string;
  sortBy?: 'created_at' | 'current_amount' | 'goal_amount' | 'end_date' | 'title';
  sortOrder?: 'ASC' | 'DESC';
  createdFrom?: string;
  createdTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
}

export interface RecentInvestment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  isAnonymous: boolean;
  investorDisplayName: string | null;
  rewardTitle?: string;
  createdAt: string;
}

export interface CampaignFinancialProgress {
  campaignId: string;
  title: string;
  currentAmount: number;
  goalAmount: number;
  remainingAmount: number;
  fundingPercentage: number;
  investorCount: number;
  currency: string;
  recentInvestments: RecentInvestment[];
}

export interface CampaignInvestor {
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  avatarUrl: string | null;
  location: string | null;
  bio: string | null;
  email: string;
  totalInvested: number;
  investmentCount: number;
  lastInvestmentAt: string;
  investmentId?: string;
  rewardTitle?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface RewardTier {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  maxClaims: number | null;
  currentClaims: number;
  estimatedDelivery: string | null;
  includesShipping: boolean;
  shippingDetails: string | null;
  imageUrl: string | null;
  expiresAt: string | null;
  items: any[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRewardTierDto {
  title: string;
  description: string;
  amount: number;
  currency?: string;
  maxClaims?: number | null;
  estimatedDelivery?: string;
  includesShipping?: boolean;
  shippingDetails?: string;
  imageUrl?: string;
  expiresAt?: string;
  items?: any[];
  sortOrder?: number;
}

export interface UpdateRewardTierDto extends Partial<CreateRewardTierDto> {
  isActive?: boolean;
}

export interface RewardClaim {
  claim_id: string;
  claim_status: string;
  tracking_number: string | null;
  tracking_url: string | null;
  investment_id: string;
  amount: number;
  invested_at: string;
  reward_title: string;
  reward_id: string;
  expires_at: string | null;
  investor_email: string;
  first_name: string;
  last_name: string;
}
