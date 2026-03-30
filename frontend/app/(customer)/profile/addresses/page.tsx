import { CustomerPlaceholderPage } from "@/app/(customer)/_components/CustomerPlaceholderPage";

export default function ProfileAddressesPage() {
  return (
    <CustomerPlaceholderPage
      title="So dia chi"
      description="Route quan ly dia chi da duoc tao san de team bo sung CRUD dia chi giao hang."
      primaryHref="/checkout"
      primaryLabel="Tiep tuc den checkout"
    />
  );
}
