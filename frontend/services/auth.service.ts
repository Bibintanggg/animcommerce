import api from "@/lib/api";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/types/auth";
import { User } from "@/types/user";
import axios from "axios";

export const login = async(payload: LoginRequest) => {
    const response = await api.post<LoginResponse>('/login', payload)
    localStorage.setItem("token", response.data.data.token)
    localStorage.setItem("user", JSON.stringify(response.data.data.user))
    
    return response.data
}

export async function getMe(): Promise<User> {
  const response = await api.get<{ data: User }>('/me')
  return response.data.data
}

export async function registerUser(payload: RegisterRequest): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>('/register', payload)
  return response.data
}