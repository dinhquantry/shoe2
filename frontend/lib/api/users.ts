import axiosClient from "@/lib/axios";
import type { AdminUser, ApiSuccessResponse } from "@/app/types";

export const usersApi = {
  async list(search?: string) {
    const query = search?.trim()
      ? `?search=${encodeURIComponent(search.trim())}`
      : "";
    const response = await axiosClient.get<ApiSuccessResponse<AdminUser[]>>(
      `/Users${query}`
    );
    return response.data;
  },

  updateStatus(id: number, status: number) {
    return axiosClient.put(`/Users/${id}`, { status });
  },
};
