"use client";

import { useEffect, useState } from "react";
import axiosClient from "@/lib/axios";
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
import type { ApiSuccessResponse, Brand } from "@/app/types";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const fetchBrands = async () => {
    try {
      const response = await axiosClient.get<ApiSuccessResponse<Brand[]>>(
        "/Brands"
      );
      setBrands(response.data);
    } catch (error) {
      console.error("Loi lay du lieu", error);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadBrands = async () => {
      try {
        const response = await axiosClient.get<ApiSuccessResponse<Brand[]>>(
          "/Brands"
        );
        if (!ignore) {
          setBrands(response.data);
        }
      } catch (error) {
        console.error("Loi lay du lieu", error);
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
    if (window.confirm("Ban co chac chan muon xoa thuong hieu nay?")) {
      try {
        await axiosClient.delete(`/Brands/${id}`);
        await fetchBrands();
      } catch {
        alert("Loi khi xoa!");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Thuong hieu</h2>
        <Button onClick={handleAdd} className="bg-zinc-900">
          <Plus className="mr-2 h-4 w-4" /> Them Brand
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead>Ten thuong hieu</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Trang thai</TableHead>
              <TableHead className="text-right">Thao tac</TableHead>
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
                      {brand.isActive ? "Hoat dong" : "An"}
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
                  Chua co du lieu
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
