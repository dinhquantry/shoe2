"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { couponsApi } from "@/lib/api";
import type { Coupon } from "@/types";

const couponSchema = z.object({
  code: z.string().min(1, "Mã giảm giá không được để trống"),
  discountType: z.string(),
  discountValue: z.number(),
  minOrderValue: z.number(),
  maxDiscountValue: z.number(),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  usageLimit: z.number().int(),
  isActive: z.boolean(),
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
  onSuccess: () => void | Promise<void>;
}

const toDateTimeLocal = (value: string) => {
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

export function CouponDialog({
  open,
  onOpenChange,
  coupon,
  onSuccess,
}: CouponDialogProps) {
  const { register, handleSubmit, setValue, reset, control } =
    useForm<CouponFormValues>({
      resolver: zodResolver(couponSchema),
      defaultValues: {
        code: "",
        discountType: "0",
        discountValue: 0,
        minOrderValue: 0,
        maxDiscountValue: 0,
        startDate: "",
        endDate: "",
        usageLimit: 1,
        isActive: true,
      },
    });

  const discountType = useWatch({ control, name: "discountType" }) ?? "0";
  const isActiveValue = useWatch({ control, name: "isActive" }) ?? true;

  useEffect(() => {
    if (coupon) {
      reset({
        code: coupon.code,
        discountType: coupon.discountType.toString(),
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscountValue: coupon.maxDiscountValue,
        startDate: toDateTimeLocal(coupon.startDate),
        endDate: toDateTimeLocal(coupon.endDate),
        usageLimit: coupon.usageLimit,
        isActive: coupon.isActive,
      });
      return;
    }

    reset({
      code: "",
      discountType: "0",
      discountValue: 0,
      minOrderValue: 0,
      maxDiscountValue: 0,
      startDate: "",
      endDate: "",
      usageLimit: 1,
      isActive: true,
    });
  }, [coupon, open, reset]);

  const onSubmit = async (values: CouponFormValues) => {
    const payload = {
      ...values,
      code: values.code.trim().toUpperCase(),
      discountType: Number(values.discountType),
    };

    try {
      if (coupon) {
        await couponsApi.update(coupon.id, payload);
      } else {
        await couponsApi.create(payload);
      }

      await onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Lỗi lưu mã giảm giá!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {coupon ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Mã giảm giá *</Label>
              <Input {...register("code")} placeholder="VD: SUMMER20" />
            </div>
            <div className="space-y-2">
              <Label>Loại giảm giá</Label>
              <Select
                onValueChange={(value) => setValue("discountType", value)}
                value={discountType}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Chọn loại giảm giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Theo phần trăm (%)</SelectItem>
                  <SelectItem value="1">Theo số tiền (VND)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Giá trị</Label>
              <Input
                type="number"
                step="0.01"
                {...register("discountValue", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Giá trị đơn tối thiểu</Label>
              <Input
                type="number"
                step="0.01"
                {...register("minOrderValue", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Giá giảm tối đa</Label>
              <Input
                type="number"
                step="0.01"
                {...register("maxDiscountValue", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Số lượng</Label>
              <Input
                type="number"
                {...register("usageLimit", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Thới gian bắt đầu</Label>
              <Input type="datetime-local" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label>Thời gian kết thúc</Label>
              <Input type="datetime-local" {...register("endDate")} />
            </div>
          </div>

            <div className="flex items-center gap-5 w-fit  px-2 py-1">  <p className="text-sm font-medium">Trạng thái</p>
              <Switch checked={isActiveValue} onCheckedChange={(value: boolean) => setValue("isActive", value)}/>
</div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600">
              {coupon ? "Lưu" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
