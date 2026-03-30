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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usersApi } from "@/lib/api";
import type { AdminUser } from "@/types";

const userSchema = z.object({
  status: z.string(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onSuccess: () => void | Promise<void>;
}

const roleLabelMap = {
  0: "Khach hang",
  1: "Admin",
} as const;

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserDialogProps) {
  const { handleSubmit, setValue, reset, control } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      status: "1",
    },
  });

  const statusValue = useWatch({ control, name: "status" }) ?? "1";

  useEffect(() => {
    if (user) {
      reset({
        status: user.status.toString(),
      });
      return;
    }

    reset({
      status: "1",
    });
  }, [user, open, reset]);

  const onSubmit = async (values: UserFormValues) => {
    if (!user) return;

    try {
      await usersApi.updateStatus(user.id, Number(values.status));
      await onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("L\u1ed7i c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i ng\u01b0\u1eddi d\u00f9ng!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>C\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i kh\u00e1ch h\u00e0ng</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>H\u1ecd t\u00ean</Label>
              <Input value={user?.fullName ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>S\u1ed1 \u0111i\u1ec7n tho\u1ea1i</Label>
              <Input value={user?.phone ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>V\u00e0i tr\u00f2</Label>
              <Input
                value={
                  roleLabelMap[user?.role as keyof typeof roleLabelMap] ?? ""
                }
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Tr\u1ea1ng th\u00e1i</Label>
              <Select
                value={statusValue}
                onValueChange={(value) => setValue("status", value)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Ch\u1ecdn tr\u1ea1ng th\u00e1i" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ho\u1ea1t \u0111\u1ed9ng</SelectItem>
                  <SelectItem value="0">B\u1ecb kh\u00f3a</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
            Admin ch\u1ec9 \u0111\u01b0\u1ee3c thay \u0111\u1ed5i tr\u1ea1ng th\u00e1i t\u00e0i kho\u1ea3n kh\u00e1ch h\u00e0ng \u1edf m\u00e0n h\u00ecnh n\u00e0y.
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
              L\u01b0u tr\u1ea1ng th\u00e1i
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
