"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { brandsApi, categoriesApi, productImagesApi, productsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import type { Brand, CategoryTreeNode } from "@/app/types";

const MAX_IMAGES_PER_PRODUCT = 4;

const formatMoney = (value: number | string) => {
  if (value === 0) return "0";
  if (!value) return "";
  const normalized = value.toString().replace(/\D/g, "");
  if (!normalized) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(normalized));
};

const parseMoney = (value: string) => {
  const normalized = value.replace(/\D/g, "");
  return normalized ? Number(normalized) : 0;
};

const productSchema = z.object({
  name: z.string().min(1, "Tên giày không được để trống"),
  description: z.string().optional(),
  basePrice: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  brandId: z.number().min(1, "Chưa chọn thương hiệu"),
  categoryId: z.number().min(1, "Chưa chọn danh mục"),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1, "Nhập mã SKU"),
        color: z.string().min(1, "Nhập màu sắc"),
        size: z.string().min(1, "Nhập size"),
        price: z.number().min(0, "Giá không hợp lệ"),
        stockQuantity: z.number().min(0, "Tồn kho không hợp lệ"),
      })
    )
    .min(1, "Sản phẩm cần ít nhất 1 biến thể"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      brandId: 0,
      categoryId: 0,
      variants: [{ sku: "", color: "", size: "", price: 0, stockQuantity: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "variants",
    control,
  });

  const previewItems = useMemo(
    () =>
      selectedImages.map((file) => ({
        name: file.name,
        previewUrl: URL.createObjectURL(file),
      })),
    [selectedImages]
  );

  useEffect(() => {
    return () => {
      previewItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [previewItems]);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        const [brandResponse, categoryResponse] = await Promise.all([
          brandsApi.list(),
          categoriesApi.tree(),
        ]);

        const flattenCategories = (items: CategoryTreeNode[]): CategoryTreeNode[] =>
          items.reduce<CategoryTreeNode[]>(
            (acc, item) => [...acc, item, ...flattenCategories(item.children ?? [])],
            []
          );

        if (!ignore) {
          setBrands(brandResponse);
          setCategories(flattenCategories(categoryResponse));
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };

    void fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  const appendImages = (files: File[]) => {
    const remainingSlots = MAX_IMAGES_PER_PRODUCT - selectedImages.length;
    if (remainingSlots <= 0) {
      alert(`Mỗi sản phẩm chỉ được tối đa ${MAX_IMAGES_PER_PRODUCT} ảnh.`);
      return;
    }

    const acceptedFiles = files
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remainingSlots);

    if (acceptedFiles.length < files.length) {
      alert(`Chỉ có thể chọn tối đa ${remainingSlots} ảnh nữa.`);
    }

    setSelectedImages((prev) => [...prev, ...acceptedFiles]);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      appendImages(Array.from(event.target.files));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const uploadImagesForProduct = async (productId: number) => {
    if (selectedImages.length === 0) return;

    setIsUploadingImages(true);
    try {
      await productImagesApi.upload(productId, selectedImages);
    } finally {
      setIsUploadingImages(false);
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const createdProduct = await productsApi.create(values);

      try {
        await uploadImagesForProduct(createdProduct.id);
        alert("Thêm sản phẩm thành công.");
        router.push("/admin/products");
      } catch (imageError) {
        console.error("Lỗi upload ảnh sau khi tạo sản phẩm:", imageError);
        alert("Đã tạo sản phẩm, nhưng upload ảnh chưa thành công. Bạn có thể bổ sung ảnh trong trang sửa.");
        router.push(`/admin/products/edit/${createdProduct.id}`);
      }
    } catch (error) {
      console.error("Lỗi tạo sản phẩm:", error);
      alert("Có lỗi xảy ra khi lưu sản phẩm. Vui lòng kiểm tra lại mã SKU và dữ liệu đã nhập.");
    }
  };

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Thêm sản phẩm mới</h2>
            <p className="text-sm text-zinc-500">
              Nhập thông tin cơ bản, hình ảnh và các biến thể của sản phẩm.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="name">Tên giày *</Label>
                <Input id="name" {...register("name")} placeholder="VD: Nike Air Force 1..." />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Giá gốc *</Label>
                <Controller
                  name="basePrice"
                  control={control}
                  render={({ field: { onChange, value, ref } }) => (
                    <div className="relative">
                      <Input
                        type="text"
                        className="pr-14 text-right font-medium"
                        value={formatMoney(value)}
                        onChange={(event) => onChange(parseMoney(event.target.value))}
                        ref={ref}
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                        VND
                      </span>
                    </div>
                  )}
                />
                {errors.basePrice && (
                  <p className="text-xs text-red-500">{errors.basePrice.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Thương hiệu *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("brandId", Number(value), { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.brandId && <p className="text-xs text-red-500">{errors.brandId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Danh mục *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("categoryId", Number(value), { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-xs text-red-500">{errors.categoryId.message}</p>
                )}
              </div>

              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="description">Mô tả chi tiết</Label>
                <textarea
                  id="description"
                  {...register("description")}
                  placeholder="Mô tả ngắn gọn về chất liệu, phong cách, đặc điểm nổi bật..."
                  className="min-h-32 w-full rounded-md border border-zinc-200 bg-white p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Hình ảnh sản phẩm</CardTitle>
            <span className="text-xs text-zinc-500">
              {selectedImages.length}/{MAX_IMAGES_PER_PRODUCT} ảnh
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 px-6 py-8 text-center transition hover:bg-zinc-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="mb-3 h-8 w-8 text-zinc-400" />
              <p className="text-sm font-medium text-zinc-700">
                Bấm để chọn ảnh từ máy tính
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Tối đa 4 ảnh. Sau khi tạo sản phẩm, ảnh đầu tiên sẽ là ảnh chính.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            {selectedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {previewItems.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-md border bg-zinc-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.previewUrl} alt={item.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeSelectedImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-red-500/85 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute left-0 top-0 rounded-br-md bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Ảnh chính
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                Chưa chọn ảnh nào. Bạn có thể bỏ qua và bổ sung ảnh sau trong trang sửa.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Danh sách biến thể</CardTitle>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  sku: "",
                  color: "",
                  size: "",
                  price: getValues("basePrice") || 0,
                  stockQuantity: 0,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm biến thể
            </Button>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto rounded-md border border-zinc-200">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b bg-zinc-50">
                  <tr>
                    <th className="whitespace-nowrap p-3 font-medium">SKU</th>
                    <th className="whitespace-nowrap p-3 font-medium">Màu sắc</th>
                    <th className="whitespace-nowrap p-3 font-medium">Size</th>
                    <th className="whitespace-nowrap p-3 font-medium">Giá riêng</th>
                    <th className="whitespace-nowrap p-3 font-medium">Tồn kho</th>
                    <th className="whitespace-nowrap p-3 text-center font-medium">Xóa</th>
                  </tr>
                </thead>

                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id} className="border-b last:border-0">
                      <td className="min-w-45 p-2">
                        <Input {...register(`variants.${index}.sku`)} />
                        {errors.variants?.[index]?.sku && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.variants[index]?.sku?.message}
                          </p>
                        )}
                      </td>

                      <td className="min-w-40 p-2">
                        <Input {...register(`variants.${index}.color`)} />
                        {errors.variants?.[index]?.color && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.variants[index]?.color?.message}
                          </p>
                        )}
                      </td>

                      <td className="min-w-30 p-2">
                        <Input {...register(`variants.${index}.size`)} />
                        {errors.variants?.[index]?.size && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.variants[index]?.size?.message}
                          </p>
                        )}
                      </td>

                      <td className="min-w-45 p-2">
                        <Controller
                          name={`variants.${index}.price`}
                          control={control}
                          render={({ field: { onChange, value, ref } }) => (
                            <div className="relative">
                              <Input
                                type="text"
                                className="pr-12 text-right"
                                value={formatMoney(value)}
                                onChange={(event) => onChange(parseMoney(event.target.value))}
                                ref={ref}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                                VND
                              </span>
                            </div>
                          )}
                        />
                        {errors.variants?.[index]?.price && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.variants[index]?.price?.message}
                          </p>
                        )}
                      </td>

                      <td className="min-w-32.5 p-2">
                        <Input
                          type="number"
                          min={0}
                          {...register(`variants.${index}.stockQuantity`, {
                            valueAsNumber: true,
                          })}
                        />
                        {errors.variants?.[index]?.stockQuantity && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.variants[index]?.stockQuantity?.message}
                          </p>
                        )}
                      </td>

                      <td className="p-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {typeof errors.variants?.message === "string" && (
              <p className="mt-3 text-xs text-red-500">{errors.variants.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white/95 px-1 py-4 backdrop-blur">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting || isUploadingImages}
          >
            {isSubmitting || isUploadingImages ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu sản phẩm"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
