"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axiosClient from "@/lib/axios";
import { generateSlug } from "@/lib/utils";

export function CategoryDialog({ open, onOpenChange, category, flatCategories, onSuccess }: any) {
  const { register, handleSubmit, setValue, reset, watch } = useForm();
  
  const nameValue = watch("name");

 useEffect(() => {
  if (nameValue) {
    setValue("slug", generateSlug(nameValue));
  }
}, [nameValue, setValue]);

  useEffect(() => {
    if (category) {
      reset({ ...category, parentId: category.parentId?.toString() || "root" }); // [cite: 80-81, 83-84]
    } else {
      reset({ name: "", slug: "", description: "", parentId: "root", isActive: true });
    }
  }, [category, reset, open]);

  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      parentId: values.parentId === "root" ? null : Number(values.parentId) // Ép kiểu về số cho Backend [cite: 80-81]
    };
    try {
      if (category) await axiosClient.put(`/Categories/${category.id}`, payload); // [cite: 26-31]
      else await axiosClient.post("/Categories", payload); // [cite: 23-26]
      onSuccess();
      onOpenChange(false);
    } catch (error) { 
      console.error(error); 
      alert("Lỗi lưu danh mục!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader><DialogTitle>{category ? "Sửa Danh mục" : "Thêm Danh mục"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Tên danh mục *</Label>
            <Input {...register("name")} />
          </div>
          <div className="space-y-2">
            <Label>Slug *</Label>
            <Input {...register("slug")} />
          </div>
          <div className="space-y-2">
            <Label>Danh mục cha</Label>
            <Select onValueChange={(val: string) => setValue("parentId", val)} value={watch("parentId") ? watch("parentId").toString() : "root"}>
              <SelectTrigger><SelectValue placeholder="Chọn danh mục cha" /></SelectTrigger>
              <SelectContent>
  <SelectItem value="root">-- Danh mục gốc --</SelectItem>
  {flatCategories.map((c: any) => {
    // 1. NGĂN CHẶN CHỌN CHÍNH NÓ LÀM CHA
    // Nếu ID của danh mục trong list bằng với ID của danh mục đang sửa thì ẩn đi
    if (category && c.id === category.id) return null;

    return (
      <SelectItem key={c.id} value={c.id.toString()}>
        {c.name}
      </SelectItem>
    );
  })}
</SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between pt-2">
            <Label>Hoạt động</Label>
            <Switch checked={watch("isActive")} onCheckedChange={(val: boolean) => setValue("isActive", val)} />
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" className="bg-blue-600">Lưu</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}