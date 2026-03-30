import { CustomerPlaceholderPage } from "@/app/(customer)/_components/CustomerPlaceholderPage";

export default function CheckoutPage() {
  return (
    <CustomerPlaceholderPage
      title="Thanh toan"
      description="Route checkout da duoc scaffold de tach rieng form dia chi, ma giam gia va tong ket don hang."
      primaryHref="/profile/addresses"
      primaryLabel="Quan ly dia chi"
    />
  );
}
