"use client";

import type { ComponentProps } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordFieldProps = ComponentProps<typeof Input> & {
  wrapperClassName?: string;
};

export function PasswordField({
  className,
  wrapperClassName,
  ...props
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={cn("relative", wrapperClassName)}>
      <Input
        {...props}
        type={isVisible ? "text" : "password"}
        className={cn(
          "h-11 rounded-2xl border-slate-200 bg-white/90 pr-11 shadow-sm",
          className
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        onClick={() => setIsVisible((value) => !value)}
        aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}
