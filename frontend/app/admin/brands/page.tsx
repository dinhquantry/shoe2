"use client";
import { useEffect, useState } from "react";
import axiosClient from "@/lib/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { BrandDialog } from "./BrandDialog";

export default function BrandsPage() {
const [brands, setBrands] = useState<any[]>([])
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [selectedBrand, setSelectedBrand] = useState(null);

  const fetchBrands = async () => {
    try {
      const response: any = await axiosClient.get("/Brands"); 
      if (response && response.data) setBrands(response.data);
      else if (Array.isArray(response)) setBrands(response);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu", error);
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleAdd = () => {
    setSelectedBrand(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (brand: any) => {
    setSelectedBrand(brand);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) {
      try {
        await axiosClient.delete(`/Brands/${id}`); 
        fetchBrands(); // Gọi lại data mới
      } catch (error) {
        alert("Lỗi khi xóa!");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Thương hiệu</h2>
        <Button onClick={handleAdd} className="bg-zinc-900"><Plus className="w-4 h-4 mr-2" /> Thêm Brand</Button>
      </div>

      <div className="bg-white rounded-md border shadow-sm">
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
            {Array.isArray(brands) && brands.length > 0 ? (
              brands.map((brand: any) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-zinc-500">{brand.slug}</TableCell>
                  <TableCell>
                    <Badge variant={brand.isActive ? "default" : "secondary"}>
                      {brand.isActive ? "Hoạt động" : "Ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button onClick={() => handleEdit(brand)} variant="ghost" size="icon"><Edit className="w-4 h-4 text-blue-600" /></Button>
                    <Button onClick={() => handleDelete(brand.id)} variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="text-center py-6 text-zinc-500">Chưa có dữ liệu</TableCell></TableRow>
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