"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const initializeAuth = useAuth((state) => state.initializeAuth);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (storedValue === "true") {
      const frameId = window.requestAnimationFrame(() => {
        setIsSidebarCollapsed(true);
      });

      return () => window.cancelAnimationFrame(frameId);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((previousValue) => {
      const nextValue = !previousValue;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextValue));
      return nextValue;
    });
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminSidebar collapsed={isSidebarCollapsed} />

      <div
        className={`flex flex-1 flex-col transition-[margin] duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <AdminHeader
          collapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />

        <main className="mt-16 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
