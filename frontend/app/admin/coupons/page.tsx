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
import { CouponDialog } from "./CouponDialog";
import type { ApiSuccessResponse, Coupon } from "@/app/types";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

const getDiscountLabel = (coupon: Coupon) =>
  coupon.discountType === 0
    ? `${coupon.discountValue}%`
    : currencyFormatter.format(coupon.discountValue);

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const fetchCoupons = async () => {
    try {
      const response = await axiosClient.get<ApiSuccessResponse<Coupon[]>>(
        "/Coupons"
      );
      setCoupons(response.data);
    } catch (error) {
      console.error("Loi lay du lieu coupon", error);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadCoupons = async () => {
      try {
        const response = await axiosClient.get<ApiSuccessResponse<Coupon[]>>(
          "/Coupons"
        );
        if (!ignore) {
          setCoupons(response.data);
        }
      } catch (error) {
        console.error("Loi lay du lieu coupon", error);
      }
    };

    void loadCoupons();

    return () => {
      ignore = true;
    };
  }, []);

  const handleAdd = () => {
    setSelectedCoupon(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Ban co chac muon xoa mem ma giam gia nay?")) {
      try {
        await axiosClient.delete(`/Coupons/${id}`);
        await fetchCoupons();
      } catch (error) {
        console.error(error);
        alert("Loi khi xoa ma giam gia!");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ma giam gia</h2>
          <p className="text-sm text-zinc-500">
            Quan ly coupon va trang thai ap dung trong he thong.
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-zinc-900">
          <Plus className="mr-2 h-4 w-4" /> Them coupon
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead>Ma</TableHead>
              <TableHead>Loai giam</TableHead>
              <TableHead>Dieu kien</TableHead>
              <TableHead>Thoi gian</TableHead>
              <TableHead>Luot dung</TableHead>
              <TableHead>Trang thai</TableHead>
              <TableHead className="text-right">Thao tac</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length > 0 ? (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{coupon.code}</p>
                      <p className="text-xs text-zinc-500">
                        {getDiscountLabel(coupon)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {coupon.discountType === 0 ? "Phan tram" : "So tien co dinh"}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm text-zinc-600">
                      <p>
                        Don toi thieu:{" "}
                        {currencyFormatter.format(coupon.minOrderValue)}
                      </p>
                      <p>
                        Giam toi da:{" "}
                        {currencyFormatter.format(coupon.maxDiscountValue)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-600">
                    <div className="space-y-1">
                      <p>{dateFormatter.format(new Date(coupon.startDate))}</p>
                      <p>{dateFormatter.format(new Date(coupon.endDate))}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-600">
                    {coupon.usedCount}/{coupon.usageLimit}
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.isActive ? "default" : "secondary"}>
                      {coupon.isActive ? "Hoat dong" : "Da tat"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      onClick={() => handleEdit(coupon)}
                      variant="ghost"
                      size="icon"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(coupon.id)}
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
                <TableCell colSpan={7} className="py-6 text-center text-zinc-500">
                  Chua co coupon nao
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CouponDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        coupon={selectedCoupon}
        onSuccess={fetchCoupons}
      />
    </div>
  );
}
