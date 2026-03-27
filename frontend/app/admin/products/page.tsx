"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "@/lib/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Search, Package } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    try {
      // Gọi API lấy danh sách sản phẩm (có thể truyền thêm search, page, pageSize)
      const response: any = await axiosClient.get(`/Products?page=1&pageSize=20&search=${searchTerm}`);
      
      // Tùy thuộc Backend trả về dạng phân trang { items: [] } hay mảng []
      if (response && response.items) setProducts(response.items);
      else if (response && response.data) setProducts(response.data);
      else if (Array.isArray(response)) setProducts(response);
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
    }
  };

  useEffect(() => {
    // Gọi lại API mỗi khi searchTerm thay đổi (có thể dùng debounce để tối ưu hơn sau này)
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await axiosClient.delete(`/Products/${id}`); // [cite: 60-62]
        fetchProducts();
      } catch (error) {
        alert("Có lỗi khi xóa sản phẩm!");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sản phẩm</h2>
          <p className="text-zinc-500 text-sm">Quản lý kho giày, biến thể và giá bán.</p>
        </div>
        
        {/* Nút chuyển sang trang Thêm mới thay vì mở Popup */}
        <Link href="/admin/products/create">
          <Button className="bg-zinc-900">
            <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
          </Button>
        </Link>
      </div>

      {/* Thanh công cụ: Tìm kiếm */}
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Tìm theo tên sản phẩm..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Giá cơ bản</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product: any) => (
                <TableRow key={product.id} className="hover:bg-zinc-50/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-zinc-100 rounded-md flex items-center justify-center border">
                        <Package className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div>
                        <p>{product.name}</p>
                        <p className="text-xs text-zinc-500">Mã: SP-{product.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-600 font-medium">
                    ${product.basePrice?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Đang bán" : "Ngừng bán"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/products/edit/${product.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                    </Link>
                    <Button onClick={() => handleDelete(product.id)} variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-zinc-500">
                  Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}