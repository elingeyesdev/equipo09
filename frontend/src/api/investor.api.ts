import axios from 'axios';
import type {
  ApiSuccessResponse,
  CapitalOverview,
  CreateInvestorProfileDto,
  InvestorProfile,
  LoginDto,
  LoginResponse,
  UpdateInvestorProfileDto,
} from '../types/investor.types';

// Base URL usa el proxy de Vite en dev, sin CORS
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Inyectar token JWT en cada petición si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// AUTH
// ============================================================

export async function login(dto: LoginDto): Promise<LoginResponse> {
  const { data } = await api.post<ApiSuccessResponse<LoginResponse>>('/auth/login', dto);
  return data.data;
}

// ============================================================
// INVESTOR PROFILE
// ============================================================

export async function getMyInvestorProfile(): Promise<InvestorProfile> {
  const { data } = await api.get<ApiSuccessResponse<InvestorProfile>>(
    '/investors/me/profile',
  );
  return data.data;
}

export async function createInvestorProfile(
  dto: CreateInvestorProfileDto,
): Promise<InvestorProfile> {
  const { data } = await api.post<ApiSuccessResponse<InvestorProfile>>(
    '/investors/me/profile',
    dto,
  );
  return data.data;
}

export async function updateInvestorProfile(
  dto: UpdateInvestorProfileDto,
): Promise<InvestorProfile> {
  const { data } = await api.put<ApiSuccessResponse<InvestorProfile>>(
    '/investors/me/profile',
    dto,
  );
  return data.data;
}

export async function deleteInvestorProfile(): Promise<void> {
  await api.delete<ApiSuccessResponse<null>>('/investors/me/profile');
}

export async function getCapitalOverview(): Promise<CapitalOverview> {
  const { data } = await api.get<ApiSuccessResponse<CapitalOverview>>(
    '/investors/me/capital',
  );
  return data.data;
}

export async function uploadInvestorAvatar(file: File): Promise<InvestorProfile> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<ApiSuccessResponse<InvestorProfile>>(
    '/investors/me/profile/avatar',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data;
}

export async function uploadInvestorCover(file: File): Promise<InvestorProfile> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<ApiSuccessResponse<InvestorProfile>>(
    '/investors/me/profile/cover',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data;
}

// ============================================================
// INVESTMENTS
// ============================================================

export interface CreateInvestmentDto {
  campaignId: string;
  amount: number;
  rewardTierId?: string;
}

export async function createInvestment(dto: CreateInvestmentDto): Promise<any> {
  const { data } = await api.post<ApiSuccessResponse<any>>(
    '/investments',
    dto,
  );
  return data.data;
}

// ============================================================
// INVESTMENT HISTORY
// ============================================================

export interface InvestmentHistoryItem {
  id: string;
  campaignId: string;
  amount: number;
  currency: string;
  status: string;
  rewardTierId: string | null;
  createdAt: string;
  campaignTitle: string;
  campaignType: string;
  campaignCover: string | null;
  campaignStatus: string;
  rewardTitle: string | null;
  rewardDescription: string | null;
}

export async function getMyInvestments(limit = 20, offset = 0): Promise<InvestmentHistoryItem[]> {
  const { data } = await api.get<ApiSuccessResponse<InvestmentHistoryItem[]>>(
    `/investments/me?limit=${limit}&offset=${offset}`,
  );
  return data.data;
}
