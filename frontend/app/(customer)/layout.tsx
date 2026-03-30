import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
