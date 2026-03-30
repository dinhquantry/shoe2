"use client";

import { useEffect, useState } from "react";
import { brandsApi } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Trash2 } from "lucide-react";
import { BrandDialog } from "./BrandDialog";
import type { Brand } from "@/types";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const fetchBrands = async () => {
    try {
      setBrands(await brandsApi.list());
    } catch (error) {
      console.error("Lỗi lấy dữ liệu", error);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadBrands = async () => {
      try {
        const brands = await brandsApi.list();
        if (!ignore) {
          setBrands(brands);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu", error);
      }
    };

    void loadBrands();

    return () => {
      ignore = true;
    };
  }, []);

  const handleAdd = () => {
    setSelectedBrand(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
      try {
        await brandsApi.remove(id);
        await fetchBrands();
      } catch {
        alert("Lỗi khi xóa!");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Thương hiệu</h2>
        <Button onClick={handleAdd} className="bg-zinc-900">
          <Plus className="mr-2 h-4 w-4" /> Thêm thương hiệu
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead>Tên thương hiệu</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length > 0 ? (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-zinc-500">{brand.slug}</TableCell>
                  <TableCell>
                    <Badge variant={brand.isActive ? "default" : "secondary"}>
                      {brand.isActive ? "Hoạt động" : "Ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      onClick={() => handleEdit(brand)}
                      variant="ghost"
                      size="icon"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(brand.id)}
                      variant="ghost"
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-zinc-500">
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <BrandDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        brand={selectedBrand}
        onSuccess={fetchBrands}
      />
    </div>
  );
}
