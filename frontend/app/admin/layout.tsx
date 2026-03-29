import type { Metadata } from "next";
import { AdminShell } from "../components/admin/admin_shell";

export const metadata: Metadata = {
  title: "Admin Dashboard - Atelier",
  description: "H\u1ec7 th\u1ed1ng qu\u1ea3n l\u00fd c\u1eeda h\u00e0ng gi\u00e0y",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
