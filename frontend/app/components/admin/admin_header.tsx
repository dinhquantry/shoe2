"use client";
import { Input } from "@/components/ui/input";
import { Search, Bell, HelpCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/app/hooks/useAuth";

export function AdminHeader() {
  const { user } = useAuth();

  // 2. Logic tạo Avatar từ tên: Nguyễn Văn A -> lấy chữ "A"
  // Nếu chưa đăng nhập hoặc chưa có tên, mặc định là "U" (User)
  const userInitial = user?.fullName ? user.fullName.split(" ").pop()?.charAt(0).toUpperCase() : "U";

  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shadow-sm">
      {/* --- BÊN TRÁI: Ô TÌM KIẾM --- */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          type="search"
          placeholder="Search customer records..."
          className="pl-10 pr-4 bg-zinc-50 border-zinc-200 focus-visible:ring-blue-500"
        />
      </div>

      {/* --- BÊN PHẢI: ICON & USER PROFILE --- */}
      <div className="flex items-center gap-5">
        {/* Các icon tiện ích */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-600 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full">
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Ngăn cách nhẹ */}
        <div className="h-8 w-px bg-zinc-200"></div>

        {/* Thông tin User */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-zinc-900 leading-none">
              {user?.fullName || "Guest User"} 
            </p>
            <p className="text-xs text-zinc-500 mt-1">Administrator</p>
          </div>
          
          <Avatar className="h-9 w-9 border border-zinc-200 shadow-sm">
            {/* Vì Swagger không có avatarUrl, ta dùng Fallback */}
            <AvatarFallback className="bg-zinc-900 text-white text-xs font-bold">
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}