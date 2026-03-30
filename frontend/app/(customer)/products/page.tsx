import { CustomerPlaceholderPage } from "@/app/(customer)/_components/CustomerPlaceholderPage";

export default function ProductsPage() {
  return (
    <CustomerPlaceholderPage
      title="Danh sach san pham"
      description="Route danh sach san pham da duoc dat dung trong nhom customer. Day la noi phu hop de gan bo loc, sap xep va truy van paging sau nay."
      primaryHref="/"
      primaryLabel="Ve trang chu"
    />
  );
}
