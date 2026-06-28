import api from "@/lib/api";
import { LoginRequest, LoginResponse } from "@/types/auth";
import axios from "axios";

export const login = async(payload: LoginRequest) => {
    const response = await api.post<LoginResponse>('/login', payload)
    localStorage.setItem("token", response.data.data.token)
    localStorage.setItem("user", JSON.stringify(response.data.data.user))
    
    return response.data
}

export async function getMe() {
    const token = localStorage.getItem("token")

}