"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { productsApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Package, Plus, Search, Trash2 } from "lucide-react";
import type { ProductListItem } from "@/app/types";
import { formatCurrency } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = useCallback(async (term: string) => {
    try {
      const result = await productsApi.list(term);
      setProducts(result.items);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu", error);
    }
  }, []);

  useEffect(() => {
    const debounceId = window.setTimeout(() => {
      void fetchProducts(searchTerm);
    }, 500);

    return () => {
      window.clearTimeout(debounceId);
    };
  }, [fetchProducts, searchTerm]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn muốn xóa sản phẩm này?")) {
      try {
        await productsApi.remove(id);
        await fetchProducts(searchTerm);
      } catch {
        alert("Có lỗi khi xóa sản phẩm");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý giày</h2>
        </div>

        <Link href="/admin/products/create">
          <Button className="bg-zinc-900">
            <Plus className="mr-2 h-4 w-4" />
            Thêm giày
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="tìm kiếm giày ..."
            className="pl-9"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead>Tên giày</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id} className="hover:bg-zinc-50/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-zinc-100">
                        <Package className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div>
                        <p>{product.name}</p>
                        <p className="text-xs text-zinc-500">Ma: SP-{product.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-zinc-600">
                    {formatCurrency(product.basePrice)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.isActive === false ? "secondary" : "default"}
                    >
                      {product.isActive === false ? "Ngừng bán" : "Đang bán"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Link href={`/admin/products/edit/${product.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleDelete(product.id)}
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
                <TableCell colSpan={5} className="py-10 text-center text-zinc-500">
                  Kho đang rỗng
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
