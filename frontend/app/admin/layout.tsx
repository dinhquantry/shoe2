// app/admin/layout.tsx
import type { Metadata } from "next";
import { AdminSidebar } from "../components/admin/admin_sidebar";
import { AdminHeader } from "../components/admin/admin_header";


export const metadata: Metadata = {
  title: "Admin Dashboard - Atelier",
  description: "Hệ thống quản lý cửa hàng giày",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* 1. Gắn Sidebar (cố định bên trái w-64) */}
      <AdminSidebar />

      {/* 2. Vùng chứa nội dung chính (bên phải, offset sang 64) */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* 3. Gắn Header (cố định trên cùng h-16) */}
        <AdminHeader />

        {/* 4. Nội dung của từng trang admin con (padding top 16 để tránh Header) */}
        <main className="flex-1 bg-zinc-50 p-6 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}