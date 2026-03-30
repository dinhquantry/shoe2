import { CustomerPlaceholderPage } from "@/app/(customer)/_components/CustomerPlaceholderPage";

export default function CartPage() {
  return (
    <CustomerPlaceholderPage
      title="Gio hang"
      description="Trang gio hang da co route rieng trong nhom customer. Ban co the noi vao cart store, coupon input va summary tai day."
      primaryHref="/checkout"
      primaryLabel="Den checkout"
    />
  );
}
