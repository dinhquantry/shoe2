"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FolderTree,
  LayoutGrid,
  LogOut,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Tag,
  TicketPercent,
  Users,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { cn } from "@/lib/utils";

const adminMenuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutGrid },
  { name: "Brands", href: "/admin/brands", icon: Tag },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Products", href: "/admin/products", icon: ShoppingBag },
  { name: "Coupons", href: "/admin/coupons", icon: TicketPercent },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

type AdminSidebarProps = {
  collapsed: boolean;
};

export function AdminSidebar({ collapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden border-r border-zinc-800 bg-zinc-950 text-zinc-200 transition-[width] duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div
        className={cn(
          "border-b border-zinc-800",
          collapsed ? "px-3 py-5" : "p-6"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "justify-between gap-3"
          )}
        >
          <div className={cn("min-w-0", collapsed && "text-center")}>
            <h1 className="text-xl font-bold text-white">
              {collapsed ? "AA" : "Atelier Admin"}
            </h1>
            {!collapsed ? (
              <p className="text-sm text-zinc-400">Premium Footwear</p>
            ) : null}
          </div>
        </div>
      </div>

      <nav
        className={cn(
          "sidebar-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1",
          collapsed ? "p-3" : "p-4"
        )}
      >
        {adminMenuItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "flex rounded-lg font-medium transition-all hover:bg-zinc-800 hover:text-white",
                collapsed
                  ? "justify-center px-3 py-3 text-zinc-400"
                  : "items-center gap-3.5 px-4 py-3 text-base",
                isActive ? "bg-zinc-800 text-blue-500" : "text-zinc-400"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed ? <span>{item.name}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-3">
        <button
          type="button"
          onClick={logout}
          className={cn(
            "flex w-full items-center rounded-lg text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white",
            collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3"
          )}
          title={collapsed ? "Đăng xuất" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed ? <span>Đăng xuất</span> : null}
        </button>
      </div>
    </aside>
  );
}
