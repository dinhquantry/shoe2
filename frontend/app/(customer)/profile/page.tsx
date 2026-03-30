import { CustomerPlaceholderPage } from "@/app/(customer)/_components/CustomerPlaceholderPage";

export default function ProfilePage() {
  return (
    <CustomerPlaceholderPage
      title="Thong tin ca nhan"
      description="Khu vuc profile da duoc dua vao route group customer va se duoc bao ve bang proxy route guard."
      primaryHref="/profile/orders"
      primaryLabel="Xem lich su don hang"
    />
  );
}
