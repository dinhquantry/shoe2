import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

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

const axiosClient = axios.create({
  baseURL: "http://localhost:5209/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request Interceptor: Tự động đính kèm Token vào mỗi yêu cầu
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (mình sẽ lưu vào đây sau khi login thành công)
    const token = localStorage.getItem("token");
    
    if (token) {
      // Định dạng Bearer {token} đúng như Swagger yêu cầu 
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: Xử lý kết quả trả về hoặc bắt lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => {
    // Backend của em trả về object trực tiếp hoặc kèm data, mình xử lý ở đây
    return response.data;
  },
  (error) => {
    // Nếu gặp lỗi 401 (Unauthorized) - Token hết hạn hoặc không hợp lệ
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token"); // Xóa token cũ
      window.location.href = "/login"; // Chuyển hướng về trang đăng nhập
    }
    return Promise.reject(error);
  }
);

export default axiosClient as ApiClient;
