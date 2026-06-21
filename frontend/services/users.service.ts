import api from "@/lib/api";
import { User } from "@/types/user";

interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export const getUsers = async ( page: number = 1,limit: number = 10 ): Promise<UsersResponse> => {
  try {
    const response = await api.get<{ data: User[]; total?: number }>(
      "/superadmin/users",
      {
        params: { page, limit },
      },
    );

    const users = response.data.data || [];
    const total = response.data.total || users.length;

    return {
      data: users,
      total: total,
      page: page,
      limit: limit,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
