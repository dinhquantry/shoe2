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
import axiosClient from "@/lib/axios";
import { generateSlug } from "@/lib/utils";
import type { Brand } from "@/app/types";

const brandSchema = z.object({
  name: z.string().min(1, "Ten khong duoc de trong"),
  slug: z.string().min(1, "Slug khong duoc de trong"),
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
        await axiosClient.put(`/Brands/${brand.id}`, values);
      } else {
        await axiosClient.post("/Brands", values);
      }

      await onSuccess();
      onOpenChange(false);
    } catch (error) {
      alert("Co loi xay ra khi luu thuong hieu!");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {brand ? "Chinh sua thuong hieu" : "Them thuong hieu moi"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Ten thuong hieu *</Label>
            <Input {...register("name")} placeholder="VD: Nike, Adidas..." />
          </div>
          <div className="space-y-2">
            <Label>Slug *</Label>
            <Input {...register("slug")} placeholder="nike, adidas..." />
          </div>
          <div className="space-y-2">
            <Label>Mo ta</Label>
            <Input
              {...register("description")}
              placeholder="Mo ta ngan..."
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <Label>Trang thai hoat dong</Label>
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
              {brand ? "Luu thay doi" : "Tao moi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
