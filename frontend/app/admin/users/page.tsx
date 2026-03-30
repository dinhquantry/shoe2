"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usersApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Search, Shield, UserCheck, Users } from "lucide-react";
import { UserDialog } from "./UserDialog";
import type { AdminUser } from "@/types";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

const roleLabelMap = {
  0: "Khach hang",
  1: "Admin",
} as const;

const statusLabelMap = {
  0: "Bi khoa",
  1: "Hoat dong",
} as const;

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async (term: string) => {
    try {
      setUsers(await usersApi.list(term));
    } catch (error) {
      console.error("Lỗi lấy dữ liệu người dùng", error);
    }
  }, []);

  useEffect(() => {
    const debounceId = window.setTimeout(() => {
      void fetchUsers(searchTerm);
    }, 350);

    return () => {
      window.clearTimeout(debounceId);
    };
  }, [fetchUsers, searchTerm]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const adminUsers = users.filter((user) => user.role === 1).length;
    const activeUsers = users.filter((user) => user.status === 1).length;

    return { totalUsers, adminUsers, activeUsers };
  }, [users]);

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Qu\u1ea3n l\u00fd ng\u01b0\u1eddi d\u00f9ng</h2>
          <p className="text-sm text-zinc-500">
            Theo d\u00f5i t\u00e0i kho\u1ea3n, quy\u1ec1n h\u1ea1n v\u00e0 tr\u1ea1ng th\u00e1i truy c\u1eadp trong h\u1ec7 th\u1ed1ng.
          </p>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="T\u00ecm theo t\u00ean, email, s\u1ed1 \u0111i\u1ec7n tho\u1ea1i..."
            className="pl-9"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-zinc-500">T\u1ed5ng ng\u01b0\u1eddi d\u00f9ng</p>
              <p className="mt-2 text-2xl font-semibold">{stats.totalUsers}</p>
            </div>
            <div className="rounded-full bg-zinc-100 p-3 text-zinc-700">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-zinc-500">T\u00e0i kho\u1ea3n admin</p>
              <p className="mt-2 text-2xl font-semibold">{stats.adminUsers}</p>
            </div>
            <div className="rounded-full bg-blue-50 p-3 text-blue-600">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-zinc-500">Đang ho\u1ea1t \u0111\u1ed9ng</p>
              <p className="mt-2 text-2xl font-semibold">{stats.activeUsers}</p>
            </div>
            <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead>Ng\u01b0\u1eddi d\u00f9ng</TableHead>
              <TableHead>V\u00e0i tr\u00f2</TableHead>
              <TableHead>Tr\u1ea1ng th\u00e1i</TableHead>
              <TableHead>Ng\u00e0y tham gia</TableHead>
              <TableHead className="text-right">Thao t\u00e1c</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-zinc-50/50">
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-zinc-500">{user.email}</p>
                      <p className="text-xs text-zinc-400">
                        {user.phone || "Ch\u01b0a c\u1eadp nh\u1eadt SDT"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 1 ? "default" : "secondary"}>
                      {roleLabelMap[user.role as keyof typeof roleLabelMap] ?? "Kh\u00f4ng r\u00f5"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 1 ? "default" : "secondary"}>
                      {statusLabelMap[user.status as keyof typeof statusLabelMap] ?? "Kh\u00f4ng r\u00f5"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-600">
                    {dateFormatter.format(new Date(user.createdAt))}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role === 0 ? (
                      <Button
                        onClick={() => handleEdit(user)}
                        variant="ghost"
                        size="icon"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                    ) : (
                      <span className="text-xs text-zinc-400">Admin n\u1ed9i b\u1ed9</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-zinc-500">
                  Ch\u01b0a c\u00f3 ng\u01b0\u1eddi d\u00f9ng ph\u00f9 h\u1ee3p
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={selectedUser}
        onSuccess={() => fetchUsers(searchTerm)}
      />
    </div>
  );
}
