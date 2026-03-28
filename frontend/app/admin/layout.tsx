import type { Metadata } from "next";
import { AdminShell } from "../components/admin/admin_shell";

export const metadata: Metadata = {
  title: "Admin Dashboard - Atelier",
  description: "He thong quan ly cua hang giay",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
