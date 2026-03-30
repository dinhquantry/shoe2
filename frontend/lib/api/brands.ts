import axiosClient from "@/lib/axios";
import type { ApiSuccessResponse, Brand } from "@/types";

export type BrandPayload = {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
};

export const brandsApi = {
  async list() {
    const response =
      await axiosClient.get<ApiSuccessResponse<Brand[]>>("/Brands");
    return response.data;
  },

  create(payload: BrandPayload) {
    return axiosClient.post("/Brands", payload);
  },

  update(id: number, payload: BrandPayload) {
    return axiosClient.put(`/Brands/${id}`, payload);
  },

  remove(id: number) {
    return axiosClient.delete(`/Brands/${id}`);
  },
};
