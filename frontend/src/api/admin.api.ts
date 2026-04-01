import axios from 'axios';
import type {
  DashboardStats,
  SystemUser,
  SystemCampaign,
  AdminUser,
} from '../types/admin.types';

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

// Admin endpoints
export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<ApiSuccessResponse<DashboardStats>>('/admin/dashboard-stats');
  return data.data;
}

export async function getAllUsers(): Promise<SystemUser[]> {
  const { data } = await api.get<ApiSuccessResponse<SystemUser[]>>('/admin/users');
  return data.data;
}

export async function getAllCampaigns(): Promise<SystemCampaign[]> {
  const { data } = await api.get<ApiSuccessResponse<SystemCampaign[]>>('/admin/campaigns');
  return data.data;
}

export async function updateCampaignStatus(id: string, status: string): Promise<any> {
  const { data } = await api.patch<ApiSuccessResponse<any>>(`/admin/campaigns/${id}/status`, { status });
  return data.data;
}

// SuperAdmin endpoints
export async function createAdmin(dto: any): Promise<any> {
  const { data } = await api.post<ApiSuccessResponse<any>>('/superadmin/admins', dto);
  return data.data;
}

export async function getAllAdmins(): Promise<AdminUser[]> {
  const { data } = await api.get<ApiSuccessResponse<AdminUser[]>>('/superadmin/admins');
  return data.data;
}

export async function softDeleteUser(id: string): Promise<any> {
  const { data } = await api.delete<ApiSuccessResponse<any>>(`/admin/users/${id}`);
  return data.data;
}

export async function hardDeleteCampaign(id: string): Promise<any> {
  const { data } = await api.delete<ApiSuccessResponse<any>>(`/admin/campaigns/${id}`);
  return data.data;
}

export async function deleteAdmin(id: string): Promise<any> {
  const { data } = await api.delete<ApiSuccessResponse<any>>(`/superadmin/admins/${id}`);
  return data.data;
}
