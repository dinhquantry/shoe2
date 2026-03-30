"use client";

import { useEffect, useState } from "react";
import { couponsApi } from "@/lib/api";
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
import { Edit, Plus } from "lucide-react";
import { CouponDialog } from "./CouponDialog";
import type { Coupon } from "@/types";

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
      setCoupons(await couponsApi.list());
    } catch (error) {
      console.error("Lỗi lấy dữ liệu coupon", error);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadCoupons = async () => {
      try {
        const data = await couponsApi.list();
        if (!ignore) {
          setCoupons(data);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu mã giảm giá", error);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Mã giảm giá</h2>
          <p className="text-sm text-zinc-500">
            Quản lý danh sách mã giảm giá trong hệ thống
          </p>
        </div>

        <Button onClick={handleAdd} className="bg-zinc-900 hover:bg-zinc-800">
          <Plus className="mr-2 h-4 w-4" />
          Thêm mã
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <Table className="w-full border-collapse">
          <TableHeader className="bg-zinc-50">
            <TableRow className="border-b border-zinc-200 hover:bg-zinc-50">
              <TableHead className="border-r border-zinc-200 px-4 py-3 font-semibold text-zinc-900">
                Mã
              </TableHead>
              <TableHead className="border-r border-zinc-200 px-4 py-3 font-semibold text-zinc-900">
                Loại giảm
              </TableHead>
              <TableHead className="border-r border-zinc-200 px-4 py-3 font-semibold text-zinc-900">
                Điều kiện
              </TableHead>
              <TableHead className="border-r border-zinc-200 px-4 py-3 font-semibold text-zinc-900">
                Thời gian
              </TableHead>
              <TableHead className="border-r border-zinc-200 px-4 py-3 font-semibold text-zinc-900">
                Lượt dùng
              </TableHead>
              <TableHead className="border-r border-zinc-200 px-4 py-3 font-semibold text-zinc-900">
                Trạng thái
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-semibold text-zinc-900">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {coupons.length > 0 ? (
              coupons.map((coupon) => (
                <TableRow
                  key={coupon.id}
                  className="border-b border-zinc-200 transition hover:bg-zinc-50"
                >
                  <TableCell className="border-r border-zinc-200 px-4 py-4 align-top">
                    <div className="space-y-1">
                      <p className="font-semibold text-zinc-900">{coupon.code}</p>
                    </div>
                  </TableCell>

                  <TableCell className="border-r border-zinc-200 px-4 py-4 align-top">
                    <p className="font-medium text-zinc-900">
                      {getDiscountLabel(coupon)}
                    </p>
                  </TableCell>

                  <TableCell className="border-r border-zinc-200 px-4 py-4 align-top">
                    <div className="space-y-1 text-sm text-zinc-600 leading-6">
                      <p>
                        Đơn tối thiểu:{" "}
                        <span className="font-medium text-zinc-700">
                          {currencyFormatter.format(coupon.minOrderValue)}
                        </span>
                      </p>
                      <p>
                        Giảm tối đa:{" "}
                        <span className="font-medium text-zinc-700">
                          {currencyFormatter.format(coupon.maxDiscountValue)}
                        </span>
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="border-r border-zinc-200 px-4 py-4 align-top">
                    <div className="space-y-1 text-sm text-zinc-600 leading-6">
                      <p>{dateFormatter.format(new Date(coupon.startDate))}</p>
                      <p>{dateFormatter.format(new Date(coupon.endDate))}</p>
                    </div>
                  </TableCell>

                  <TableCell className="border-r border-zinc-200 px-4 py-4 align-top text-sm text-zinc-700">
                    <span className="font-medium">
                      {coupon.usedCount}/{coupon.usageLimit}
                    </span>
                  </TableCell>

                  <TableCell className="border-r border-zinc-200 px-4 py-4 align-top">
                    <Badge
                      variant={coupon.isActive ? "default" : "secondary"}
                      className={
                        coupon.isActive
                          ? "rounded-full px-3 py-1"
                          : "rounded-full px-3 py-1"
                      }
                    >
                      {coupon.isActive ? "Hoạt động" : "Đã tắt"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-4 text-right align-top">
                    <Button
                      onClick={() => handleEdit(coupon)}
                      variant="ghost"
                      size="icon"
                      className="hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-sm text-zinc-500"
                >
                  Chưa có coupon nào
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
