"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/app/hooks/useAuth";

export function AdminHeader() {
  const { user } = useAuth();
  const userInitial = user?.fullName
    ? user.fullName.split(" ").pop()?.charAt(0).toUpperCase()
    : "U";

  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-end border-b border-zinc-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold leading-none text-zinc-900">
            {user?.fullName || "Guest User"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Administrator</p>
        </div>

        <Avatar className="h-9 w-9 border border-zinc-200 shadow-sm">
          <AvatarFallback className="bg-zinc-900 text-xs font-bold text-white">
            {userInitial}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
