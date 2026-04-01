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
  categoryId?: string;
}

export interface QueryCampaignsDto {
  page?: number;
  limit?: number;
  status?: CampaignStatus;
  campaignType?: CampaignType;
  search?: string;
  sortBy?: 'created_at' | 'current_amount' | 'goal_amount' | 'end_date' | 'title';
  sortOrder?: 'ASC' | 'DESC';
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
