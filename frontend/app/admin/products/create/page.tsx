"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosClient from "@/lib/axios";
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
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import type { ApiSuccessResponse, Brand, CategoryTreeNode } from "@/app/types";

const productSchema = z.object({
  name: z.string().min(1, "Ten san pham khong duoc de trong"),
  description: z.string().optional(),
  basePrice: z.number().min(0, "Gia phai lon hon hoac bang 0"),
  brandId: z.number().min(1, "Vui long chon thuong hieu"),
  categoryId: z.number().min(1, "Vui long chon danh muc"),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1, "Nhap ma SKU"),
        color: z.string().min(1, "Nhap mau sac"),
        size: z.string().min(1, "Nhap size"),
        price: z.number().min(0, "Gia khong hop le"),
        stockQuantity: z.number().min(0, "Ton kho khong hop le"),
      })
    )
    .min(1, "San pham phai co it nhat 1 bien the"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);

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
      variants: [
        {
          sku: "",
          color: "",
          size: "",
          price: 0,
          stockQuantity: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "variants",
    control,
  });

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        const [brandResponse, categoryResponse] = await Promise.all([
          axiosClient.get<ApiSuccessResponse<Brand[]>>("/Brands"),
          axiosClient.get<ApiSuccessResponse<CategoryTreeNode[]>>(
            "/Categories/tree"
          ),
        ]);

        const flattenCategories = (
          items: CategoryTreeNode[]
        ): CategoryTreeNode[] =>
          items.reduce<CategoryTreeNode[]>(
            (acc, item) => [
              ...acc,
              item,
              ...flattenCategories(item.children ?? []),
            ],
            []
          );

        if (!ignore) {
          setBrands(brandResponse.data);
          setCategories(flattenCategories(categoryResponse.data));
        }
      } catch (error) {
        console.error("Loi lay du lieu goc", error);
      }
    };

    void fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      await axiosClient.post("/Products", values);
      alert("Them san pham thanh cong!");
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      alert("Co loi xay ra khi luu san pham!");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">Them san pham moi</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thong tin co ban</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Ten san pham *</Label>
                <Input
                  {...register("name")}
                  placeholder="VD: Nike Air Jordan 1..."
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Gia co ban *</Label>
                <Input
                  type="number"
                  {...register("basePrice", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.basePrice && (
                  <p className="text-xs text-red-500">
                    {errors.basePrice.message}
                  </p>
                )}
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Mo ta san pham</Label>
                <textarea
                  {...register("description")}
                  className="min-h-[100px] w-full rounded-md border p-3 text-sm"
                  placeholder="Nhap mo ta chi tiet..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label>Thuong hieu *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("brandId", Number(value), { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chon thuong hieu" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.brandId && (
                  <p className="text-xs text-red-500">
                    {errors.brandId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Danh muc *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("categoryId", Number(value), {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chon danh muc" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-xs text-red-500">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bien the (Size / Mau sac)</CardTitle>
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
              <Plus className="mr-2 h-4 w-4" /> Them bien the
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.variants?.root && (
              <p className="text-sm text-red-500">
                {errors.variants.root.message}
              </p>
            )}

            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-zinc-50">
                  <tr>
                    <th className="p-3 font-medium">SKU</th>
                    <th className="p-3 font-medium">Mau sac</th>
                    <th className="w-24 p-3 font-medium">Size</th>
                    <th className="w-32 p-3 font-medium">Gia rieng</th>
                    <th className="w-24 p-3 font-medium">Ton kho</th>
                    <th className="w-12 p-3 text-center font-medium">Xoa</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr
                      key={field.id}
                      className="border-b last:border-0 hover:bg-zinc-50/50"
                    >
                      <td className="p-2">
                        <Input
                          {...register(`variants.${index}.sku`)}
                          placeholder="NK-WHT-42"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          {...register(`variants.${index}.color`)}
                          placeholder="Trang"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          {...register(`variants.${index}.size`)}
                          placeholder="42"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          {...register(`variants.${index}.price`, {
                            valueAsNumber: true,
                          })}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          {...register(`variants.${index}.stockQuantity`, {
                            valueAsNumber: true,
                          })}
                        />
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
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Huy bo
          </Button>
          <Button type="submit" className="bg-blue-600" disabled={isSubmitting}>
            {isSubmitting ? "Dang luu..." : "Luu san pham"}
          </Button>
        </div>
      </form>
    </div>
  );
}
