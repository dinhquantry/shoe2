"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, ArrowLeft } from "lucide-react";

// 1. Định nghĩa Schema bám sát 100% Swagger [cite: 87-90, 101-103]
const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  description: z.string().optional(),
  // Dùng z.coerce.number() để ép kiểu string từ Input HTML thành Number cho Backend
  basePrice: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  brandId: z.coerce.number().min(1, "Vui lòng chọn thương hiệu"),
  categoryId: z.coerce.number().min(1, "Vui lòng chọn danh mục"),
  variants: z.array(
    z.object({
      sku: z.string().min(1, "Nhập mã SKU"),
      color: z.string().min(1, "Nhập màu sắc"),
      size: z.string().min(1, "Nhập Size"),
      price: z.coerce.number().min(0, "Giá không hợp lệ"),
      stockQuantity: z.coerce.number().min(0, "Tồn kho không hợp lệ"),
    })
  ).min(1, "Sản phẩm phải có ít nhất 1 phân loại (Size/Màu)"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // 2. Khởi tạo Form
  const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", description: "", basePrice: 0,
      brandId: 0, categoryId: 0,
      variants: [{ sku: "", color: "", size: "", price: 0, stockQuantity: 0 }] // Mặc định có 1 dòng biến thể
    }
  });

  // 3. Khởi tạo Field Array cho Biến thể
  const { fields, append, remove } = useFieldArray({
    name: "variants",
    control: control,
  });

  // 4. Lấy dữ liệu Dropdown (Brands & Categories)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandRes, catRes]: any = await Promise.all([
          axiosClient.get("/Brands"),
          axiosClient.get("/Categories/tree")
        ]);
        
        // Xử lý dữ liệu Brand
        if (brandRes && brandRes.data) setBrands(brandRes.data);
        else if (Array.isArray(brandRes)) setBrands(brandRes);

        // Xử lý dữ liệu Category (Làm phẳng cây để đưa vào Select)
        const rawCats = catRes?.data || (Array.isArray(catRes) ? catRes : []);
        const flatten = (cats: any[]): any[] => cats.reduce((acc, cat) => [...acc, cat, ...flatten(cat.children || [])], []);
        setCategories(flatten(rawCats));

      } catch (error) { console.error("Lỗi lấy dữ liệu gốc", error); }
    };
    fetchData();
  }, []);

  // 5. Submit Dữ liệu
  const onSubmit = async (values: ProductFormValues) => {
    try {
      // Gọi API POST /api/Products 
      await axiosClient.post("/Products", values);
      alert("Thêm sản phẩm thành công!");
      router.push("/admin/products"); // Quay về danh sách
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi lưu sản phẩm!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="text-2xl font-bold">Thêm sản phẩm mới</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* --- PHẦN 1: THÔNG TIN CƠ BẢN --- */}
        <Card>
          <CardHeader><CardTitle>Thông tin cơ bản</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Tên sản phẩm *</Label>
                <Input {...register("name")} placeholder="VD: Nike Air Jordan 1..." />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label>Giá cơ bản (Base Price) *</Label>
                <Input type="number" {...register("basePrice")} placeholder="0.00" />
                {errors.basePrice && <p className="text-red-500 text-xs">{errors.basePrice.message}</p>}
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Mô tả sản phẩm</Label>
                <textarea 
                  {...register("description")} 
                  className="w-full min-h-[100px] p-3 border rounded-md text-sm" 
                  placeholder="Nhập mô tả chi tiết..." 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label>Thương hiệu *</Label>
                <Select onValueChange={(val) => setValue("brandId", Number(val))}>
                  <SelectTrigger><SelectValue placeholder="Chọn thương hiệu" /></SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.brandId && <p className="text-red-500 text-xs">{errors.brandId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Danh mục *</Label>
                <Select onValueChange={(val) => setValue("categoryId", Number(val))}>
                  <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-red-500 text-xs">{errors.categoryId.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- PHẦN 2: BIẾN THỂ (SIZE / MÀU) --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Biến thể (Size / Màu sắc)</CardTitle>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => append({ sku: "", color: "", size: "", price: watch("basePrice") || 0, stockQuantity: 0 })}
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm biến thể
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.variants?.root && <p className="text-red-500 text-sm">{errors.variants.root.message}</p>}
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 border-b">
                  <tr>
                    <th className="p-3 font-medium">SKU (Mã)</th>
                    <th className="p-3 font-medium">Màu sắc</th>
                    <th className="p-3 font-medium w-24">Size</th>
                    <th className="p-3 font-medium w-32">Giá riêng</th>
                    <th className="p-3 font-medium w-24">Tồn kho</th>
                    <th className="p-3 font-medium w-12 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id} className="border-b last:border-0 hover:bg-zinc-50/50">
                      <td className="p-2"><Input {...register(`variants.${index}.sku`)} placeholder="NK-WHT-42" /></td>
                      <td className="p-2"><Input {...register(`variants.${index}.color`)} placeholder="Trắng" /></td>
                      <td className="p-2"><Input {...register(`variants.${index}.size`)} placeholder="42" /></td>
                      <td className="p-2"><Input type="number" {...register(`variants.${index}.price`)} /></td>
                      <td className="p-2"><Input type="number" {...register(`variants.${index}.stockQuantity`)} /></td>
                      <td className="p-2 text-center">
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* --- NÚT SUBMIT --- */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Hủy bỏ</Button>
          <Button type="submit" className="bg-blue-600" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu Sản Phẩm"}
          </Button>
        </div>
      </form>
    </div>
  );
}