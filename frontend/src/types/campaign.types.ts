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
