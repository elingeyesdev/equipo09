import axios from 'axios';
import type {
  EntrepreneurCampaign,
  CreateCampaignDto,
  QueryCampaignsDto,
  PaginatedResponse,
  CampaignFinancialProgress,
  CampaignInvestor,
  RewardTier,
  CreateRewardTierDto,
  UpdateRewardTierDto,
  RewardClaim,
} from '../types/campaign.types';
import type { CampaignHistoryItem } from '../types/admin.types';

interface ApiSuccessResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function buildCampaignQueryParams(query?: QueryCampaignsDto): Record<string, string | number> | undefined {
  if (!query) return undefined;
  const params: Record<string, string | number> = {};
  (Object.entries(query) as [keyof QueryCampaignsDto, unknown][]).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) return;
    params[key as string] = value as string | number;
  });
  return Object.keys(params).length ? params : undefined;
}

export async function getMyCampaigns(
  query?: QueryCampaignsDto,
): Promise<PaginatedResponse<EntrepreneurCampaign>> {
  const { data } = await api.get<ApiSuccessResponse<PaginatedResponse<EntrepreneurCampaign>>>(
    '/entrepreneurs/me/campaigns',
    { params: buildCampaignQueryParams(query) },
  );
  return data.data;
}

export async function getMyCampaignById(
  id: string,
): Promise<EntrepreneurCampaign> {
  const { data } = await api.get<ApiSuccessResponse<EntrepreneurCampaign>>(
    `/entrepreneurs/me/campaigns/${id}`,
  );
  return data.data;
}

export async function createCampaign(
  dto: CreateCampaignDto,
): Promise<EntrepreneurCampaign> {
  const { data } = await api.post<ApiSuccessResponse<EntrepreneurCampaign>>(
    '/entrepreneurs/me/campaigns',
    dto,
  );
  return data.data;
}

export async function updateCampaign(
  campaignId: string,
  dto: Partial<CreateCampaignDto>,
): Promise<EntrepreneurCampaign> {
  const { data } = await api.patch<ApiSuccessResponse<EntrepreneurCampaign>>(
    `/entrepreneurs/me/campaigns/${campaignId}`,
    dto,
  );
  return data.data;
}

export async function submitCampaignForReview(
  campaignId: string,
): Promise<EntrepreneurCampaign> {
  const { data } = await api.post<ApiSuccessResponse<EntrepreneurCampaign>>(
    `/entrepreneurs/me/campaigns/${campaignId}/submit-for-review`,
  );
  return data.data;
}

export async function publishCampaign(
  campaignId: string,
): Promise<EntrepreneurCampaign> {
  const { data } = await api.post<ApiSuccessResponse<EntrepreneurCampaign>>(
    `/entrepreneurs/me/campaigns/${campaignId}/publish`,
  );
  return data.data;
}

export async function getCampaignFinancialProgress(
  campaignId: string,
): Promise<CampaignFinancialProgress> {
  const { data } = await api.get<ApiSuccessResponse<CampaignFinancialProgress>>(
    `/entrepreneurs/me/campaigns/${campaignId}/financial-progress`,
  );
  return data.data;
}

export async function uploadCampaignImage(
  campaignId: string,
  file: File,
): Promise<EntrepreneurCampaign> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<ApiSuccessResponse<EntrepreneurCampaign>>(
    `/entrepreneurs/me/campaigns/${campaignId}/cover`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data;
}

export async function getCampaignHistory(
  campaignId: string,
): Promise<CampaignHistoryItem[]> {
  const { data } = await api.get<ApiSuccessResponse<CampaignHistoryItem[]>>(
    `/entrepreneurs/me/campaigns/${campaignId}/history`,
  );
  return data.data;
}

export async function getCampaignInvestors(
  campaignId: string,
  page: number = 1,
  limit: number = 20,
): Promise<PaginatedResponse<CampaignInvestor>> {
  const { data } = await api.get<ApiSuccessResponse<PaginatedResponse<CampaignInvestor>>>(
    `/entrepreneurs/me/campaigns/${campaignId}/investors`,
    { params: { page, limit } },
  );
  return data.data;
}

export async function getRewardTiers(
  campaignId: string,
): Promise<RewardTier[]> {
  const { data } = await api.get<ApiSuccessResponse<RewardTier[]>>(
    `/campaigns/${campaignId}/rewards/all`,
  );
  return data.data;
}

export async function createRewardTier(
  campaignId: string,
  dto: CreateRewardTierDto,
): Promise<RewardTier> {
  const { data } = await api.post<ApiSuccessResponse<RewardTier>>(
    `/campaigns/${campaignId}/rewards`,
    dto,
  );
  return data.data;
}

export async function updateRewardTier(
  campaignId: string,
  rewardId: string,
  dto: UpdateRewardTierDto,
): Promise<RewardTier> {
  const { data } = await api.patch<ApiSuccessResponse<RewardTier>>(
    `/campaigns/${campaignId}/rewards/${rewardId}`,
    dto,
  );
  return data.data;
}

export async function deleteRewardTier(
  campaignId: string,
  rewardId: string,
): Promise<void> {
  await api.delete(`/campaigns/${campaignId}/rewards/${rewardId}`);
}

export async function getRewardClaims(
  campaignId: string,
): Promise<RewardClaim[]> {
  const { data } = await api.get<ApiSuccessResponse<RewardClaim[]>>(
    `/campaigns/${campaignId}/rewards/claims`,
  );
  return data.data;
}

export async function updateRewardClaim(
  campaignId: string,
  claimId: string,
  dto: { status?: string; trackingNumber?: string; trackingUrl?: string; notes?: string },
): Promise<RewardClaim> {
  const { data } = await api.patch<ApiSuccessResponse<RewardClaim>>(
    `/campaigns/${campaignId}/rewards/claims/${claimId}`,
    dto,
  );
  return data.data;
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  await api.delete(`/entrepreneurs/me/campaigns/${campaignId}`);
}

export async function finalizeCampaign(campaignId: string): Promise<EntrepreneurCampaign> {
  const { data } = await api.post<ApiSuccessResponse<EntrepreneurCampaign>>(
    `/entrepreneurs/me/campaigns/${campaignId}/finalize`
  );
  return data.data;
}
