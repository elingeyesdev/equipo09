export interface DashboardStats {
  totalUsers: number;
  totalCampaigns: number;
  totalFunded: number;
}

export interface SystemUser {
  id: string;
  email: string;
  created_at: string;
  is_active: boolean;
}

export interface SystemCampaign {
  id: string;
  title: string;
  status: string;
  goal_amount: string;
  current_amount: string;
  created_at: string;
  creator_email: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  access_level: string;
  is_active: boolean;
  email: string;
}
