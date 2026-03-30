import { CustomerPlaceholderPage } from "@/app/(customer)/_components/CustomerPlaceholderPage";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  return (
    <CustomerPlaceholderPage
      title={`Chi tiet san pham: ${slug}`}
      description="Route chi tiet da san sang theo cau truc [slug]. Team co the noi gallery, bien the, review va add-to-cart tai day."
      primaryHref="/products"
      primaryLabel="Xem danh sach san pham"
    />
  );
}
