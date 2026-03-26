export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Chỗ này lát nữa anh em mình sẽ gắn <Header /> vào */}
      
      <main className="flex-1">{children}</main>
      
      {/* Chỗ này lát nữa sẽ gắn <Footer /> vào */}
    </div>
  );
}