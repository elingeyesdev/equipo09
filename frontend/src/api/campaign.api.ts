import axios from 'axios';
import type {
  EntrepreneurCampaign,
  CreateCampaignDto,
  QueryCampaignsDto,
  PaginatedResponse,
  CampaignFinancialProgress,
} from '../types/campaign.types';

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

export async function createCampaign(
  dto: CreateCampaignDto,
): Promise<EntrepreneurCampaign> {
  const { data } = await api.post<ApiSuccessResponse<EntrepreneurCampaign>>(
    '/entrepreneurs/me/campaigns',
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
