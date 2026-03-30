"use client";

import Link from "next/link";
import { useState } from "react";
import type { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import type { ApiErrorResponse } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";
import { parseAuthUserFromToken } from "@/lib/auth-user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/app/(auth)/_components/password-field";

const loginSchema = z.object({
  email: z.string().email("Vui lòng nhập địa chỉ email hợp lệ."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  defaultEmail: string;
  registered: boolean;
};

export function LoginForm({ defaultEmail, registered }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const setAuth = useAuth((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setLoginError("");

    try {
      const response = await authApi.login(values);

      if (!response.token) {
        setLoginError("Đăng nhập không thành công. Vui lòng thử lại.");
        return;
      }

      const authUser = parseAuthUserFromToken(response.token);
      setAuth(authUser, response.token);

      window.location.href = authUser.role === "Admin" ? "/admin" : "/";
    } catch (error: unknown) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      setLoginError(
        apiError.response?.data?.error?.message ??
          apiError.response?.data?.message ??
          "Email hoặc mật khẩu chưa đúng."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-[2rem] border border-white/80 bg-white/88 py-6 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] ring-0 backdrop-blur">
      <CardHeader className="space-y-4 px-6 sm:px-8">
        <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
          Chào mừng quay lại
        </span>
        <div className="space-y-2">
          <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-base leading-7 text-slate-600">
            Truy cập tài khoản để theo dõi đơn hàng, quản lý địa chỉ và thao tác nhanh hơn
            trong cửa hàng.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-6 sm:px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {registered && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
              Đăng ký thành công. Bạn có thể đăng nhập ngay bằng tài khoản vừa tạo.
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-slate-700">
              Email
            </Label>
            <Input
              id="email"
              {...register("email")}
              placeholder="ban@email.com"
              type="email"
              aria-invalid={Boolean(errors.email)}
              className="h-11 rounded-2xl border-slate-200 bg-white/90 shadow-sm"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password" className="text-slate-700">
                Mật khẩu
              </Label>
              <span className="text-xs text-slate-400">Dành cho admin và khách hàng</span>
            </div>
            <PasswordField
              id="password"
              {...register("password")}
              placeholder="Nhập mật khẩu của bạn"
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {loginError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
              {loginError}
            </div>
          )}

          <Button
            type="submit"
            className="h-11 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isLoading ? "Đang xử lý..." : "Đăng nhập ngay"}
          </Button>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="font-semibold text-slate-950 transition-colors hover:text-sky-700"
            >
              Đăng ký ngay
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
