"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import axiosClient from "@/lib/axios";
import { generateSlug } from "@/lib/utils";

// Schema khớp với BrandCreateDto / BrandUpdateDto [cite: 73-78]
const brandSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  slug: z.string().min(1, "Slug không được để trống"),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export function BrandDialog({ open, onOpenChange, brand, onSuccess }: any) {
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: "", slug: "", description: "", isActive: true }
  });

  const nameValue = watch("name");

 useEffect(() => {
  if (nameValue) {
    setValue("slug", generateSlug(nameValue));
  }
}, [nameValue, setValue]);

  useEffect(() => {
    if (brand) {
      reset({ ...brand, description: brand.description || "" });
    } else {
      reset({ name: "", slug: "", description: "", isActive: true });
    }
  }, [brand, reset, open]);

  const onSubmit = async (values: any) => {
    try {
      if (brand) {
        await axiosClient.put(`/Brands/${brand.id}`, values); // [cite: 15-19]
      } else {
        await axiosClient.post("/Brands", values); // [cite: 9-12]
      }
      onSuccess(); // Load lại bảng
      onOpenChange(false); // Đóng popup
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu Thương hiệu!");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{brand ? "Chỉnh sửa Thương hiệu" : "Thêm Thương hiệu mới"}</DialogTitle>
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
            <Input {...register("description")} placeholder="Mô tả ngắn..." />
          </div>
          <div className="flex items-center justify-between pt-2">
            <Label>Trạng thái hoạt động</Label>
            <Switch 
              checked={watch("isActive")} 
              onCheckedChange={(val: boolean) => setValue("isActive", val)} 
            />
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" className="bg-blue-600">{brand ? "Lưu thay đổi" : "Tạo mới"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}