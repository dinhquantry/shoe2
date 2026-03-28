export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorPayload {
  code?: string;
  message?: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  error?: ApiErrorPayload;
}

export interface AuthLoginResponse {
  success: boolean;
  message: string;
  token?: string;
}

export interface AuthUser {
  fullName: string;
  email: string;
  role?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
}

export interface CategoryTreeNode {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  parentId?: number | null;
  children: CategoryTreeNode[];
}

export interface ProductVariantSummary {
  id: number;
  sku: string;
  size: string;
  color: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  basePrice: number;
  brandId: number;
  brandName: string;
  categoryId: number;
  categoryName: string;
  variants: ProductVariantSummary[];
  isActive: boolean;
}

export interface ProductListResponse {
  items: ProductListItem[];
  pageInfo: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export type ProductDetail = ProductListItem;
