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
import { categoriesApi } from "@/lib/api";
import { generateSlug } from "@/lib/utils";
import type { CategoryTreeNode } from "@/types";

const categorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống"),
  slug: z.string().min(1, "Slug không được để trống"),
  description: z.string().optional(),
  parentId: z.string(),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryTreeNode | null;
  flatCategories: CategoryTreeNode[];
  onSuccess: () => void | Promise<void>;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  flatCategories,
  onSuccess,
}: CategoryDialogProps) {
  const { register, handleSubmit, setValue, reset, control } =
    useForm<CategoryFormValues>({
      resolver: zodResolver(categorySchema),
      defaultValues: {
        name: "",
        slug: "",
        description: "",
        parentId: "root",
        isActive: true,
      },
    });

  const nameValue = useWatch({ control, name: "name" });
  const parentId = useWatch({ control, name: "parentId" }) ?? "root";
  const isActiveValue = useWatch({ control, name: "isActive" }) ?? true;

  useEffect(() => {
    if (nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, setValue]);

  useEffect(() => {
    if (category) {
      reset({
        ...category,
        description: category.description ?? "",
        parentId: category.parentId?.toString() || "root",
      });
      return;
    }

    reset({
      name: "",
      slug: "",
      description: "",
      parentId: "root",
      isActive: true,
    });
  }, [category, open, reset]);

  const onSubmit = async (values: CategoryFormValues) => {
    const payload = {
      ...values,
      parentId: values.parentId === "root" ? null : Number(values.parentId),
    };

    try {
      if (category) {
        await categoriesApi.update(category.id, payload);
      } else {
        await categoriesApi.create(payload);
      }

      await onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Lỗi lưu danh mục!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{category ? "Sửa danh mục" : "Thêm danh mục"}</DialogTitle>
        </DialogHeader>
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
            <Select
              onValueChange={(value: string) => setValue("parentId", value)}
              value={parentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục cha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">-- Danh mục gốc --</SelectItem>
                {flatCategories.map((item) => {
                  if (category && item.id === category.id) {
                    return null;
                  }

                  return (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
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
            <Button type="submit" className="bg-blue-600">
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
