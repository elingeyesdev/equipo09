import axios from 'axios';
import type {
  EntrepreneurCampaign,
  CreateCampaignDto,
  QueryCampaignsDto,
  PaginatedResponse,
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

export async function getMyCampaigns(
  query?: QueryCampaignsDto,
): Promise<PaginatedResponse<EntrepreneurCampaign>> {
  const { data } = await api.get<ApiSuccessResponse<PaginatedResponse<EntrepreneurCampaign>>>(
    '/entrepreneurs/me/campaigns',
    { params: query }
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
