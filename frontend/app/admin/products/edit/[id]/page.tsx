"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosClient from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import { ProductImageManager } from "@/app/components/admin/VariantImageUploadDialog";
import type {
  ApiSuccessResponse,
  Brand,
  CategoryTreeNode,
  ProductDetail,
  ProductVariantSummary,
} from "@/app/types";

type VariantEditorState = {
  sku: string;
  color: string;
  size: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
};

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

const productUpdateSchema = z.object({
  name: z.string().min(1, "Ten giay khong duoc trong"),
  description: z.string().optional(),
  basePrice: z.number().min(0, "Gia phai lon hon hoac bang 0"),
  brandId: z.number().min(1, "Chua chon thuong hieu"),
  categoryId: z.number().min(1, "Chua chon danh muc"),
  isActive: z.boolean(),
});

type ProductUpdateValues = z.infer<typeof productUpdateSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [variants, setVariants] = useState<ProductVariantSummary[]>([]);

  const [addVariantOpen, setAddVariantOpen] = useState(false);
  const [newVariant, setNewVariant] = useState<VariantEditorState>({
    sku: "",
    color: "",
    size: "",
    price: 0,
    stockQuantity: 0,
    isActive: true,
  });

  const [editVariantOpen, setEditVariantOpen] = useState(false);
  const [editVariantId, setEditVariantId] = useState(0);
  const [editVariantData, setEditVariantData] = useState<VariantEditorState>({
    sku: "",
    color: "",
    size: "",
    price: 0,
    stockQuantity: 0,
    isActive: true,
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductUpdateValues>({
    resolver: zodResolver(productUpdateSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      brandId: 0,
      categoryId: 0,
      isActive: true,
    },
  });

  const brandIdValue = useWatch({ control, name: "brandId" }) ?? 0;
  const categoryIdValue = useWatch({ control, name: "categoryId" }) ?? 0;
  const isActiveValue = useWatch({ control, name: "isActive" }) ?? true;

  const fetchAllData = useCallback(async () => {
    try {
      const [brandRes, catRes, productRes] = await Promise.all([
        axiosClient.get<ApiSuccessResponse<Brand[]>>("/Brands"),
        axiosClient.get<ApiSuccessResponse<CategoryTreeNode[]>>("/Categories/tree"),
        axiosClient.get<ApiSuccessResponse<ProductDetail>>(`/Products/${productId}`),
      ]);

      const flattenCategories = (items: CategoryTreeNode[]): CategoryTreeNode[] =>
        items.reduce<CategoryTreeNode[]>(
          (acc, item) => [...acc, item, ...flattenCategories(item.children ?? [])],
          []
        );

      setBrands(brandRes.data);
      setCategories(flattenCategories(catRes.data));

      const product = productRes.data;
      reset({
        name: product.name,
        description: product.description ?? "",
        basePrice: product.basePrice,
        brandId: product.brandId,
        categoryId: product.categoryId,
        isActive: product.isActive,
      });
      setVariants(product.variants ?? []);
    } catch (error) {
      console.error("Loi lay du lieu:", error);
    }
  }, [productId, reset]);

  useEffect(() => {
    if (!productId) return;

    const timeoutId = window.setTimeout(() => {
      void fetchAllData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [productId, fetchAllData]);

  const onSubmitProduct = async (values: ProductUpdateValues) => {
    try {
      await axiosClient.put(`/Products/${productId}`, values);
      alert("Cap nhat thong tin chung thanh cong.");
      await fetchAllData();
    } catch (error) {
      console.error("Loi cap nhat san pham:", error);
      alert("Loi khi cap nhat san pham.");
    }
  };

  const handleAddVariant = async () => {
    if (!newVariant.sku || !newVariant.color || !newVariant.size) {
      alert("Vui long nhap du SKU, mau va size.");
      return;
    }

    try {
      await axiosClient.post("/ProductVariants", {
        ...newVariant,
        productId,
      });
      alert("Them bien the thanh cong.");
      setAddVariantOpen(false);
      setNewVariant({
        sku: "",
        color: "",
        size: "",
        price: 0,
        stockQuantity: 0,
        isActive: true,
      });
      await fetchAllData();
    } catch (error) {
      console.error("Loi them bien the:", error);
      alert("Loi khi them bien the. Hay kiem tra lai SKU.");
    }
  };

  const openAddVariantDialog = () => {
    setNewVariant({
      sku: "",
      color: "",
      size: "",
      price: getValues("basePrice") || 0,
      stockQuantity: 0,
      isActive: true,
    });
    setAddVariantOpen(true);
  };

  const openEditVariantDialog = (variant: ProductVariantSummary) => {
    setEditVariantId(variant.id);
    setEditVariantData({
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      price: variant.price,
      stockQuantity: variant.stockQuantity,
      isActive: variant.isActive,
    });
    setEditVariantOpen(true);
  };

  const handleUpdateVariant = async () => {
    if (!editVariantData.sku || !editVariantData.color || !editVariantData.size) {
      alert("Vui long nhap du SKU, mau va size.");
      return;
    }

    try {
      await axiosClient.put(`/ProductVariants/${editVariantId}`, editVariantData);
      alert("Cap nhat bien the thanh cong.");
      setEditVariantOpen(false);
      await fetchAllData();
    } catch (error) {
      console.error("Loi cap nhat bien the:", error);
      alert("Loi khi cap nhat bien the. Hay kiem tra lai SKU.");
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    if (!window.confirm("Ban co chac muon xoa bien the nay?")) return;

    try {
      await axiosClient.delete(`/ProductVariants/${variantId}`);
      alert("Da xoa bien the.");
      await fetchAllData();
    } catch (error) {
      console.error("Loi xoa bien the:", error);
      alert("Loi khi xoa bien the.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">Chinh sua san pham</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmitProduct)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thong tin co ban</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Ten giay *</Label>
                <Input {...register("name")} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Gia goc *</Label>
                <Controller
                  name="basePrice"
                  control={control}
                  render={({ field: { onChange, value, ref } }) => (
                    <div className="relative">
                      <Input
                        type="text"
                        className="pr-8 text-right font-medium"
                        value={formatMoney(value)}
                        onChange={(event) => onChange(parseMoney(event.target.value))}
                        ref={ref}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                        VND
                      </span>
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="invisible">Trang thai</Label>
                <div className="flex h-10 items-center justify-between rounded-md border bg-zinc-50/50 px-3">
                  <Label className="cursor-pointer">Dang kinh doanh</Label>
                  <Switch
                    checked={isActiveValue}
                    onCheckedChange={(value) =>
                      setValue("isActive", value, { shouldDirty: true })
                    }
                  />
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Mo ta</Label>
                <textarea
                  {...register("description")}
                  className="min-h-24 w-full rounded-md border p-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Thuong hieu *</Label>
                <Select
                  value={brandIdValue > 0 ? brandIdValue.toString() : undefined}
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
              </div>

              <div className="space-y-2">
                <Label>Danh muc *</Label>
                <Select
                  value={categoryIdValue > 0 ? categoryIdValue.toString() : undefined}
                  onValueChange={(value) =>
                    setValue("categoryId", Number(value), { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chon danh muc" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-blue-600" disabled={isSubmitting}>
                {isSubmitting ? "Dang luu..." : "Luu thong tin"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Hinh anh san pham</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductImageManager
            productId={productId}
            productName={getValues("name") || `San pham #${productId}`}
            onSuccess={fetchAllData}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Danh sach bien the</CardTitle>
            <p className="mt-1 text-sm text-zinc-500">
              Ban co the them, sua day du SKU, mau, size, gia, ton kho va trang thai.
            </p>
          </div>
          <Button
            onClick={openAddVariantDialog}
            variant="outline"
            size="sm"
            className="bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Them bien the
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Mau / Size</TableHead>
                  <TableHead className="text-right">Gia ban</TableHead>
                  <TableHead className="text-center">Ton kho</TableHead>
                  <TableHead className="text-center">Trang thai</TableHead>
                  <TableHead className="text-right">Thao tac</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.length > 0 ? (
                  variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell className="font-medium text-xs">{variant.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="mr-1">
                          {variant.color}
                        </Badge>
                        <Badge variant="secondary">Size {variant.size}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-zinc-600">
                        {formatMoney(variant.price)} VND
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={variant.stockQuantity > 0 ? "outline" : "destructive"}
                        >
                          {variant.stockQuantity} chiec
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={variant.isActive ? "outline" : "secondary"}>
                          {variant.isActive ? "Dang ban" : "Ngung ban"}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-1 text-right">
                        <Button
                          onClick={() => openEditVariantDialog(variant)}
                          variant="ghost"
                          size="icon"
                          title="Sua bien the"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteVariant(variant.id)}
                          variant="ghost"
                          size="icon"
                          title="Xoa"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-zinc-500">
                      Chua co bien the nao
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={addVariantOpen} onOpenChange={setAddVariantOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Them bien the moi</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Ma SKU *</Label>
              <Input
                placeholder="VD: NK-RED-40"
                value={newVariant.sku}
                onChange={(event) =>
                  setNewVariant({ ...newVariant, sku: event.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Mau sac *</Label>
                <Input
                  placeholder="VD: Do"
                  value={newVariant.color}
                  onChange={(event) =>
                    setNewVariant({ ...newVariant, color: event.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Size *</Label>
                <Input
                  placeholder="VD: 40"
                  value={newVariant.size}
                  onChange={(event) =>
                    setNewVariant({ ...newVariant, size: event.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Gia ban le</Label>
                <div className="relative">
                  <Input
                    type="text"
                    className="pr-6 text-right"
                    value={formatMoney(newVariant.price)}
                    onChange={(event) =>
                      setNewVariant({
                        ...newVariant,
                        price: parseMoney(event.target.value),
                      })
                    }
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                    VND
                  </span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Ton kho</Label>
                <Input
                  type="number"
                  className="text-center"
                  value={newVariant.stockQuantity}
                  onChange={(event) =>
                    setNewVariant({
                      ...newVariant,
                      stockQuantity: parseInt(event.target.value, 10) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddVariantOpen(false)}>
              Huy
            </Button>
            <Button className="bg-zinc-900" onClick={handleAddVariant}>
              Luu bien the
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editVariantOpen} onOpenChange={setEditVariantOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cap nhat bien the</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Ma SKU *</Label>
              <Input
                value={editVariantData.sku}
                onChange={(event) =>
                  setEditVariantData({ ...editVariantData, sku: event.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Mau sac *</Label>
                <Input
                  value={editVariantData.color}
                  onChange={(event) =>
                    setEditVariantData({ ...editVariantData, color: event.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Size *</Label>
                <Input
                  value={editVariantData.size}
                  onChange={(event) =>
                    setEditVariantData({ ...editVariantData, size: event.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Gia ban le</Label>
                <div className="relative">
                  <Input
                    type="text"
                    className="pr-6 text-right font-medium text-blue-600"
                    value={formatMoney(editVariantData.price)}
                    onChange={(event) =>
                      setEditVariantData({
                        ...editVariantData,
                        price: parseMoney(event.target.value),
                      })
                    }
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                    VND
                  </span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>So luong trong kho</Label>
                <Input
                  type="number"
                  className="text-center"
                  value={editVariantData.stockQuantity}
                  onChange={(event) =>
                    setEditVariantData({
                      ...editVariantData,
                      stockQuantity: parseInt(event.target.value, 10) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-md border p-3">
              <Label className="cursor-pointer">Kinh doanh loai nay</Label>
              <Switch
                checked={editVariantData.isActive}
                onCheckedChange={(value) =>
                  setEditVariantData({ ...editVariantData, isActive: value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditVariantOpen(false)}>
              Huy
            </Button>
            <Button className="bg-blue-600" onClick={handleUpdateVariant}>
              Cap nhat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
