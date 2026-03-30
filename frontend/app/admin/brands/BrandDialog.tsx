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
import { brandsApi } from "@/lib/api";
import { generateSlug } from "@/lib/utils";
import type { Brand } from "@/types";

const brandSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  slug: z.string().min(1, "Slug không được để trống"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type BrandFormValues = z.infer<typeof brandSchema>;

interface BrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
  onSuccess: () => void | Promise<void>;
}

export function BrandDialog({
  open,
  onOpenChange,
  brand,
  onSuccess,
}: BrandDialogProps) {
  const { register, handleSubmit, setValue, control, reset } =
    useForm<BrandFormValues>({
      resolver: zodResolver(brandSchema),
      defaultValues: {
        name: "",
        slug: "",
        description: "",
        isActive: true,
      },
    });

  const nameValue = useWatch({ control, name: "name" });
  const isActiveValue = useWatch({ control, name: "isActive" }) ?? true;

  useEffect(() => {
    if (nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, setValue]);

  useEffect(() => {
    if (brand) {
      reset({ ...brand, description: brand.description ?? "" });
      return;
    }

    reset({ name: "", slug: "", description: "", isActive: true });
  }, [brand, open, reset]);

  const onSubmit = async (values: BrandFormValues) => {
    try {
      if (brand) {
        await brandsApi.update(brand.id, values);
      } else {
        await brandsApi.create(values);
      }

      await onSuccess();
      onOpenChange(false);
    } catch (error) {
      alert("Có lỗi khi lấy dữ liệu!");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {brand ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Tên thương hiệu *</Label>
            <Input {...register("name")} placeholder="VD: Nike, Adidas..." />
          </div>
          <div className="space-y-2">
            <Label>Slug *</Label>
            <Input {...register("slug")} placeholder="nike, adidas..." />
          </div>
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Input
              {...register("description")}
              placeholder="Mô tả 1 chút ..."
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <Label>Trạng thái</Label>
            <Switch
              checked={isActiveValue}
              onCheckedChange={(value: boolean) =>
                setValue("isActive", value)
              }
            />
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Huy
            </Button>
            <Button type="submit" className="bg-blue-600">
              {brand ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
