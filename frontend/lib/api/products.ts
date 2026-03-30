import axiosClient from "@/lib/axios";
import type {
  ApiSuccessResponse,
  ProductDetail,
  ProductListResponse,
} from "@/types";

export type ProductVariantPayload = {
  sku: string;
  color: string;
  size: string;
  price: number;
  stockQuantity: number;
  isActive?: boolean;
  productId?: number;
};

export type ProductCreatePayload = {
  name: string;
  description?: string;
  basePrice: number;
  brandId: number;
  categoryId: number;
  variants: Array<{
    sku: string;
    color: string;
    size: string;
    price: number;
    stockQuantity: number;
  }>;
};

export type ProductUpdatePayload = {
  name: string;
  description?: string;
  basePrice: number;
  brandId: number;
  categoryId: number;
  isActive: boolean;
};

export const productsApi = {
  async list(search = "") {
    const response =
      await axiosClient.get<ApiSuccessResponse<ProductListResponse>>(
        `/Products?page=1&pageSize=20&search=${encodeURIComponent(search)}`
      );
    return response.data;
  },

  async getById(productId: number) {
    const response =
      await axiosClient.get<ApiSuccessResponse<ProductDetail>>(
        `/Products/${productId}`
      );
    return response.data;
  },

  async create(payload: ProductCreatePayload) {
    const response = await axiosClient.post<
      ApiSuccessResponse<ProductDetail>,
      ProductCreatePayload
    >("/Products", payload);
    return response.data;
  },

  update(productId: number, payload: ProductUpdatePayload) {
    return axiosClient.put(`/Products/${productId}`, payload);
  },

  remove(productId: number) {
    return axiosClient.delete(`/Products/${productId}`);
  },

  createVariant(payload: ProductVariantPayload) {
    return axiosClient.post("/ProductVariants", payload);
  },

  updateVariant(variantId: number, payload: ProductVariantPayload) {
    return axiosClient.put(`/ProductVariants/${variantId}`, payload);
  },

  removeVariant(variantId: number) {
    return axiosClient.delete(`/ProductVariants/${variantId}`);
  },
};
