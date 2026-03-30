import axiosClient from "@/lib/axios";
import type { ApiSuccessResponse, ProductImageItem } from "@/types";

export const productImagesApi = {
  async listByProduct(productId: number) {
    const response = await axiosClient.get<ApiSuccessResponse<ProductImageItem[]>>(
      `/ProductImages/product/${productId}`
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  upload(productId: number, files: File[]) {
    const formData = new FormData();
    formData.append("ProductId", productId.toString());
    files.forEach((file) => formData.append("Files", file));

    return axiosClient.post("/ProductImages/upload", formData);
  },

  remove(imageId: number) {
    return axiosClient.delete(`/ProductImages/${imageId}`);
  },

  setMain(imageId: number) {
    return axiosClient.put(`/ProductImages/${imageId}/set-main`);
  },
};
