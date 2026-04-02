import axios from 'axios';
import type {
  ApiSuccessResponse,
  CampaignCreationReadiness,
  CreateEntrepreneurProfileDto,
  EntrepreneurProfile,
  UpdateEntrepreneurProfileDto,
} from '../types/entrepreneur.types';

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

export async function getMyEntrepreneurProfile(): Promise<EntrepreneurProfile> {
  const { data } = await api.get<ApiSuccessResponse<EntrepreneurProfile>>(
    '/entrepreneurs/me/profile',
  );
  return data.data;
}

export async function getCampaignCreationReadiness(): Promise<CampaignCreationReadiness> {
  const { data } = await api.get<ApiSuccessResponse<CampaignCreationReadiness>>(
    '/entrepreneurs/me/profile/campaign-readiness',
  );
  return data.data;
}

export async function createEntrepreneurProfile(
  dto: CreateEntrepreneurProfileDto,
): Promise<EntrepreneurProfile> {
  const { data } = await api.post<ApiSuccessResponse<EntrepreneurProfile>>(
    '/entrepreneurs/me/profile',
    dto,
  );
  return data.data;
}
export async function updateEntrepreneurProfile(
  dto: UpdateEntrepreneurProfileDto,
): Promise<EntrepreneurProfile> {
  const { data } = await api.put<ApiSuccessResponse<EntrepreneurProfile>>(
    '/entrepreneurs/me/profile',
    dto,
  );
  return data.data;
}
