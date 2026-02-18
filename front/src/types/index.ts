export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  password?: string; 
  name: string;
  role: UserRole;
  company_id?: string; 
  createdAt: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string; 
  created_at: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  name: string;
  logoUrl?: string;
  createdAt: string;
}

export interface Dashboard {
  id: string;
  title: string;
  description?: string;
  embed_url: string; 
  company_id: string; 
  created_at: string;
  updated_at?: string;
  last_updated?: string; 
}

export interface Document {
  id: string;
  company_id: string;
  file_url: string; 
  file_type: string; 
  file_name: string;
  file_size?: number;
  created_at: string;
  updated_at?: string;
}

export interface Announcement {
  id: string;
  message: string;
  date: string;
  active: boolean;
  company_id?: string; 
  created_at: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  user_id: string; 
  company_id?: string; 
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export interface GroupSummary {
  group_id: number;
  group_name: string;
}

export interface CustomerDashboard {
  customer_id: number;
  customer_name: string;
  qty_report: number | string; 
  groups: GroupSummary[];
}