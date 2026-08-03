import { UserAddress } from "./user_address";

export type UserStatus = "active" | "inactive" | "banned";
export type UserRole = "superadmin" | "admin" | "customer";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  addresses?: UserAddress[];
  user_address?: string;
  status: UserStatus;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  city: string;
  lat: number;
  lng: number;
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DeleteUserResponse {
  message: string
}

export interface ResetPasswordRequest {
  new_password: string
}

export interface ResetPasswordResponse {
  message: string
}