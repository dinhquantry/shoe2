"use client";
import { useEffect, useState, useMemo } from "react";
import axiosClient from "@/lib/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, FolderTree } from "lucide-react";
import { CategoryDialog } from "./CategoryDialog";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const response: any = await axiosClient.get("/Categories/tree"); // [cite: 22-23]
      if (response && response.data) setCategories(response.data);
      else if (Array.isArray(response)) setCategories(response);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchCategories(); }, []);

  // Chuyển dạng cây thành mảng phẳng để đưa vào Dropdown Chọn Danh Mục Cha
  const flatCategories = useMemo(() => {
    const flatten = (cats: any[]): any[] => cats.reduce((acc, cat) => [...acc, cat, ...flatten(cat.children || [])], []);
    return flatten(categories);
  }, [categories]);

  const toggleRow = (id: number) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Xóa danh mục này sẽ xóa cả danh mục con. Tiếp tục?")) {
      try {
        await axiosClient.delete(`/Categories/${id}`); // [cite: 31-34]
        fetchCategories();
      } catch (error) { alert("Lỗi khi xóa!"); }
    }
  };

  const handleEdit = (cat: any) => {
    setSelectedCategory(cat);
    setIsDialogOpen(true);
  };

  const RenderCategoryRow = ({ category, depth = 0 }: { category: any; depth: number }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedRows.includes(category.id);

    return (
      <>
        <TableRow className="hover:bg-zinc-50/50">
          <TableCell className="font-medium">
            <div className="flex items-center" style={{ paddingLeft: `${depth * 24}px` }}>
              {hasChildren ? (
                <button onClick={() => toggleRow(category.id)} className="mr-2 text-zinc-500">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : <span className="w-6" />}
              <FolderTree size={16} className="mr-2 text-blue-500" />
              {category.name}
            </div>
          </TableCell>
          <TableCell className="text-zinc-500">{category.slug}</TableCell>
          <TableCell>
            <Badge variant={category.isActive ? "default" : "secondary"}>
              {category.isActive ? "Hoạt động" : "Ẩn"}
            </Badge>
          </TableCell>
          <TableCell className="text-right space-x-2">
            <Button onClick={() => handleEdit(category)} variant="ghost" size="icon"><Edit className="w-4 h-4 text-blue-600" /></Button>
            <Button onClick={() => handleDelete(category.id)} variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-red-500" /></Button>
          </TableCell>
        </TableRow>
        {isExpanded && hasChildren && category.children.map((child: any) => (
          <RenderCategoryRow key={child.id}
          category={{ ...child, parentId: category.id }}
          depth={depth + 1} />
        ))}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Danh mục sản phẩm</h2>
        <Button onClick={() => { setSelectedCategory(null); setIsDialogOpen(true); }} className="bg-zinc-900">
          <Plus className="w-4 h-4 mr-2" /> Tạo danh mục
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead className="w-[40%]">Tên danh mục</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length > 0 ? categories.map((cat: any) => (
              <RenderCategoryRow key={cat.id} category={cat} depth={0} />
            )) : <TableRow><TableCell colSpan={4} className="text-center py-6">Chưa có dữ liệu</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <CategoryDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        category={selectedCategory} 
        flatCategories={flatCategories}
        onSuccess={fetchCategories} 
      />
    </div>
  );
}