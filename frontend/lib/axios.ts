import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import { clearAuthSession } from "@/lib/auth-session";

type ApiClient = Omit<AxiosInstance, "get" | "post" | "put" | "delete"> & {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>;
  put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>;
};

export const API_BASE_URL = "http://localhost:5209";

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuthSession();

      const isAuthPage =
        typeof window !== "undefined" &&
        ["/login", "/register"].includes(window.location.pathname);

      if (typeof window !== "undefined" && !isAuthPage) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient as ApiClient;
