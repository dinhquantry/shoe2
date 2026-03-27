"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
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
import {
  ChevronDown,
  ChevronRight,
  Edit,
  FolderTree,
  Plus,
  Trash2,
} from "lucide-react";
import { CategoryDialog } from "./CategoryDialog";
import type { ApiSuccessResponse, CategoryTreeNode } from "@/app/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryTreeNode | null>(null);

  const fetchCategories = async () => {
    try {
      const response = await axiosClient.get<
        ApiSuccessResponse<CategoryTreeNode[]>
      >("/Categories/tree");
      setCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadCategories = async () => {
      try {
        const response = await axiosClient.get<
          ApiSuccessResponse<CategoryTreeNode[]>
        >("/Categories/tree");
        if (!ignore) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  const flatCategories = useMemo(() => {
    const flatten = (items: CategoryTreeNode[]): CategoryTreeNode[] =>
      items.reduce<CategoryTreeNode[]>(
        (acc, item) => [...acc, item, ...flatten(item.children ?? [])],
        []
      );

    return flatten(categories);
  }, [categories]);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Xoa danh muc nay va tiep tuc?")) {
      try {
        await axiosClient.delete(`/Categories/${id}`);
        await fetchCategories();
      } catch {
        alert("Loi khi xoa!");
      }
    }
  };

  const handleEdit = (category: CategoryTreeNode) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const renderCategoryRow = (
    category: CategoryTreeNode,
    depth = 0
  ): ReactNode => {
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedRows.includes(category.id);

    return (
      <>
        <TableRow className="hover:bg-zinc-50/50">
          <TableCell className="font-medium">
            <div
              className="flex items-center"
              style={{ paddingLeft: `${depth * 24}px` }}
            >
              {hasChildren ? (
                <button
                  onClick={() => toggleRow(category.id)}
                  className="mr-2 text-zinc-500"
                >
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              ) : (
                <span className="w-6" />
              )}
              <FolderTree size={16} className="mr-2 text-blue-500" />
              {category.name}
            </div>
          </TableCell>
          <TableCell className="text-zinc-500">{category.slug}</TableCell>
          <TableCell>
            <Badge variant={category.isActive ? "default" : "secondary"}>
              {category.isActive ? "Hoat dong" : "An"}
            </Badge>
          </TableCell>
          <TableCell className="space-x-2 text-right">
            <Button
              onClick={() => handleEdit(category)}
              variant="ghost"
              size="icon"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              onClick={() => handleDelete(category.id)}
              variant="ghost"
              size="icon"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </TableCell>
        </TableRow>
        {isExpanded &&
          hasChildren &&
          category.children.map((child) =>
            renderCategoryRow({ ...child, parentId: category.id }, depth + 1)
          )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Danh muc san pham</h2>
        <Button
          onClick={() => {
            setSelectedCategory(null);
            setIsDialogOpen(true);
          }}
          className="bg-zinc-900"
        >
          <Plus className="mr-2 h-4 w-4" /> Tao danh muc
        </Button>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead className="w-[40%]">Ten danh muc</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Trang thai</TableHead>
              <TableHead className="text-right">Thao tac</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length > 0 ? (
              categories.map((category) => renderCategoryRow(category))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center">
                  Chua co du lieu
                </TableCell>
              </TableRow>
            )}
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
