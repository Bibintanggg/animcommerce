import api from "@/lib/api";
import { RecentActivity } from "@/types/recent-activity";
import { DeleteUserResponse, ResetPasswordRequest, ResetPasswordResponse, User, UsersResponse } from "@/types/user";


interface ActivityRegisteredResponse {
  data: RecentActivity[];
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

export const getRecentRegisteredUsers = async (limit: number = 5): Promise<RecentActivity[]> => {
  const response = await api.get<ActivityRegisteredResponse>("/superadmin/dashboard", {
    params: {
      limit,
    },
  });
  return response.data.data;
};

export const usersResetPassword = async (userId: number, data: ResetPasswordRequest) => {
  const response = await api.patch<ResetPasswordResponse>(`/superadmin/users/${userId}/reset-password`, data)
  return response.data.message
}