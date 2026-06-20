import api from "@/lib/api"
import { UserResponse } from "@/types/user"

export const getUsers = async () => {
    const response = await api.get<UserResponse>('/superadmin/users')
    return response.data.data
}