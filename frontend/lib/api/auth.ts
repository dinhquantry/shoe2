import type { AuthLoginResponse, AuthRegisterResponse } from "@/app/types";
import axiosClient from "@/lib/axios";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
};

export const authApi = {
  login(payload: LoginPayload) {
    return axiosClient.post<AuthLoginResponse, LoginPayload>(
      "/Auth/login",
      payload
    );
  },
  register(payload: RegisterPayload) {
    return axiosClient.post<AuthRegisterResponse, RegisterPayload>(
      "/Auth/register",
      payload
    );
  },
};
