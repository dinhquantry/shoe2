import axiosClient from "@/lib/axios";
import type { ApiSuccessResponse, Coupon } from "@/types";

export type CouponPayload = {
  code: string;
  discountType: number;
  discountValue: number;
  minOrderValue: number;
  maxDiscountValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  isActive: boolean;
};

export const couponsApi = {
  async list() {
    const response =
      await axiosClient.get<ApiSuccessResponse<Coupon[]>>("/Coupons");
    return response.data;
  },

  create(payload: CouponPayload) {
    return axiosClient.post("/Coupons", payload);
  },

  update(id: number, payload: CouponPayload) {
    return axiosClient.put(`/Coupons/${id}`, payload);
  },

  remove(id: number) {
    return axiosClient.delete(`/Coupons/${id}`);
  },
};
