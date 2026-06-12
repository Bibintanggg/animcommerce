import api from "@/lib/api";
import { LoginRequest, LoginResponse } from "@/types/auth";
import axios from "axios";

export const login = async(payload: LoginRequest) => {
    const response = await api.post<LoginResponse>('/login', payload)
    return response.data
}