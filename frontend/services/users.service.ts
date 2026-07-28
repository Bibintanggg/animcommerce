import api from "@/lib/api";
import { User } from "@/types/user";

interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DeleteUserResponse {
  message: string
}

export const getUsers = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<UsersResponse> => {
  const response = await api.get<{ data: User[]; total: number }>(
    "/superadmin/users",
    {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
      },
    },
  );

  const total = response.data.total;

  return {
    data: response.data.data,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

export const deleteUser = async (userId: number) => {
  const response = await api.delete<DeleteUserResponse>(`/superadmin/users/${userId}`);
  return response.data
}