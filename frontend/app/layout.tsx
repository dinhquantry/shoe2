import type { Metadata } from "next";
import "./globals.css"; 
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
    <html lang="vi">
      <body>
        {/* Nơi chứa tất cả các trang của dự án */}
        {children}
      </body>
    </html>
  );
}