"use client";

import { useState } from "react";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";

import axiosClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ApiErrorResponse, AuthLoginResponse } from "@/app/types";

const loginSchema = z.object({
  email: z.string().email("Email khong dung dinh dang"),
  password: z.string().min(1, "Vui long nhap mat khau"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type JwtPayload = {
  role?: string;
  ["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]?: string;
};

function getRoleFromToken(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return "User";

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = atob(
      normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=")
    );
    const parsedPayload = JSON.parse(decodedPayload) as JwtPayload;

    return (
      parsedPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      parsedPayload.role ??
      "User"
    );
  } catch {
    return "User";
  }
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setLoginError("");

    try {
      const response = await axiosClient.post<AuthLoginResponse, LoginFormValues>(
        "/Auth/login",
        values
      );

      if (!response.token) {
        setLoginError("Dang nhap khong thanh cong");
        return;
      }

      const role = getRoleFromToken(response.token);

      localStorage.setItem("token", response.token);
      Cookies.set("token", response.token, { expires: 7 });
      Cookies.set("role", role, { expires: 7 });

      window.location.href = role === "Admin" ? "/admin" : "/";
    } catch (error: unknown) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      setLoginError(
        apiError.response?.data?.error?.message ??
          apiError.response?.data?.message ??
          "Email hoac mat khau khong dung!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">Dang nhap</CardTitle>
          <CardDescription className="text-center">
            Nhap tai khoan admin de quan ly cua hang giay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                {...register("email")}
                placeholder="admin@example.com"
                type="email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                {...register("password")}
                placeholder="********"
                type="password"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {loginError && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-500">
                {loginError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-zinc-800"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Dang xu ly..." : "Dang nhap ngay"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
