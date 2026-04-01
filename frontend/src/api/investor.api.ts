import axios from 'axios';
import type {
  ApiSuccessResponse,
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
  const { data } = await api.post<LoginResponse>('/auth/login', dto);
  return data;
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
