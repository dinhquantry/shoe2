"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type AdminHeaderProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function AdminHeader({ collapsed, onToggle }: AdminHeaderProps) {
  const { user } = useAuth();

  return (
    <header
      className={cn(
        "fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 shadow-sm transition-[left] duration-300",
        collapsed ? "left-20" : "left-64"
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onToggle}
        className="border-zinc-200 bg-white shadow-sm"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </Button>

      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">
            {user?.fullName || "Guest User"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {user?.email || "No email available"}
          </p>
        </div>
      </div>
    </header>
  );
}
