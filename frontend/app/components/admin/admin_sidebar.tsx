"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Tag,
  FolderTree,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Định nghĩa mảng Menu để code gọn gàng, dễ thêm bớt sau này
const adminMenuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutGrid },
  { name: "Brands", href: "/admin/brands", icon: Tag },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Products", href: "/admin/products", icon: ShoppingBag },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/users", icon: Users },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname(); 

  return (
    <aside className="flex h-screen w-64 flex-col fixed left-0 top-0 z-40 bg-zinc-950 text-zinc-200 border-r border-zinc-800">
      {/* 1. Header Sidebar: Logo & Title */}
      <div className="flex flex-col p-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white">Atelier Admin</h1>
        <p className="text-sm text-zinc-400">Premium Footwear</p>
      </div>

      {/* 2. Main Navigation: Menu List */}
      <nav className="flex-1 space-y-2 p-4">
        {adminMenuItems.map((item) => {
          const isActive = pathname === item.href; // Check active
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 rounded-lg px-4 py-3 text-base font-medium transition-all hover:bg-zinc-800 hover:text-white",
                isActive
                  ? "bg-zinc-800 text-blue-500"
                  : "text-zinc-400"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
