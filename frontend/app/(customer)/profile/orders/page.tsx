import { CustomerPlaceholderPage } from "@/app/(customer)/_components/CustomerPlaceholderPage";

export default function ProfileOrdersPage() {
  return (
    <CustomerPlaceholderPage
      title="Lich su don hang"
      description="Route nay danh cho danh sach don hang cua khach. Sau nay co the ket noi orders API va trang chi tiet don hang."
      primaryHref="/profile"
      primaryLabel="Ve trang tai khoan"
    />
  );
}
