import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Shop Giày Sneaker",
  description: "Đồ án tốt nghiệp E-commerce Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("font-sans", geist.variable)}>
      <body>
        {/* Nơi chứa tất cả các trang của dự án */}
        {children}
      </body>
    </html>
  );
}