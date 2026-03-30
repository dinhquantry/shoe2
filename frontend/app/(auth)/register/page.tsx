"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import type { ApiErrorResponse } from "@/types";
import { PasswordField } from "@/app/(auth)/_components/password-field";
import { authApi } from "@/lib/api";
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

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Vui lòng nhập họ và tên đầy đủ."),
    email: z.string().trim().email("Vui lòng nhập địa chỉ email hợp lệ."),
    phone: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) => !value || /^(0|\+84)\d{9,10}$/.test(value),
        "Số điện thoại chưa hợp lệ."
      ),
    password: z.string().min(6, "Mật khẩu cần có ít nhất 6 ký tự."),
    confirmPassword: z.string().min(6, "Vui lòng xác nhận lại mật khẩu."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận chưa khớp.",
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setSubmitError("");

    try {
      await authApi.register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || undefined,
        password: values.password,
      });

      router.push(
        `/login?registered=1&email=${encodeURIComponent(values.email.trim())}`
      );
    } catch (error: unknown) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      setSubmitError(
        apiError.response?.data?.error?.message ??
          apiError.response?.data?.message ??
          "Đăng ký không thành công. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-[2rem] border border-white/80 bg-white/88 py-6 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] ring-0 backdrop-blur">
      <CardHeader className="space-y-4 px-6 sm:px-8">
        <span className="inline-flex w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          Tạo tài khoản mới
        </span>
        <div className="space-y-2">
          <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
            Đăng ký
          </CardTitle>
          <CardDescription className="text-base leading-7 text-slate-600">
            Tạo tài khoản để mua sắm nhanh hơn, lưu thông tin cá nhân và theo dõi đơn
            hàng thuận tiện.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-6 sm:px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="fullName" className="text-slate-700">
                Họ và tên
              </Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="Nguyễn Văn A"
                aria-invalid={Boolean(errors.fullName)}
                className="h-11 rounded-2xl border-slate-200 bg-white/90 shadow-sm"
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            <div className="grid gap-2 sm:col-span-2">
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

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="phone" className="text-slate-700">
                Số điện thoại
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="0912345678"
                type="tel"
                aria-invalid={Boolean(errors.phone)}
                className="h-11 rounded-2xl border-slate-200 bg-white/90 shadow-sm"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-700">
                Mật khẩu
              </Label>
              <PasswordField
                id="password"
                {...register("password")}
                placeholder="Tối thiểu 6 ký tự"
                aria-invalid={Boolean(errors.password)}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-slate-700">
                Xác nhận mật khẩu
              </Label>
              <PasswordField
                id="confirmPassword"
                {...register("confirmPassword")}
                placeholder="Nhập lại mật khẩu"
                aria-invalid={Boolean(errors.confirmPassword)}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            Mật khẩu cần có ít nhất 6 ký tự. Bạn có thể dùng email thật để nhận hỗ trợ
            quản lý đơn hàng sau này.
          </div>

          {submitError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
              {submitError}
            </div>
          )}

          <Button
            type="submit"
            className="h-11 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </Button>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-semibold text-slate-950 transition-colors hover:text-sky-700"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
