import axiosClient from "@/lib/axios";
import type { ApiSuccessResponse, CategoryTreeNode } from "@/types";

export type CategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  parentId: number | null;
  isActive: boolean;
};

export const categoriesApi = {
  async tree() {
    const response = await axiosClient.get<ApiSuccessResponse<CategoryTreeNode[]>>(
      "/Categories/tree"
    );
    return response.data;
  },

  create(payload: CategoryPayload) {
    return axiosClient.post("/Categories", payload);
  },

  update(id: number, payload: CategoryPayload) {
    return axiosClient.put(`/Categories/${id}`, payload);
  },

  remove(id: number) {
    return axiosClient.delete(`/Categories/${id}`);
  },
};
