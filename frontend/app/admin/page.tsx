// app/admin/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Zap, Wallet } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// 1. Giả lập dữ liệu khách hàng mới (Mock Data) 
// Sau này em sẽ gọi API từ Backend ASP.NET Core để lấy đống này
const recentSignups = [
  { id: 1, name: "Elena Soprano", time: "Joined 2h ago", location: "Milan, IT", status: "VIP", initial: "ES" },
  { id: 2, name: "Marcus Kael", time: "Joined 5h ago", location: "London, UK", status: "NEW", initial: "MK" },
  { id: 3, name: "Sarah Tan", time: "Joined 1d ago", location: "Singapore", status: "NEW", initial: "ST" },
  { id: 4, name: "Julian Reed", time: "Joined 1d ago", location: "New York, US", status: "VIP", initial: "JR" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* --- PHẦN 1: TIÊU ĐỀ --- */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Customer Insights</h2>
        <p className="text-zinc-500">Performance analytics and demographic profiling for the current fiscal quarter.</p>
      </div>

      {/* --- PHẦN 2: CÁC THẺ THỐNG KÊ (GRID 3 CỘT) --- */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Thẻ 1: Tổng dữ liệu */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase text-blue-600 tracking-wider">Total Database</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12,842</div>
            <p className="text-xs text-blue-500 flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3" /> +14.2% from last month
            </p>
          </CardContent>
        </Card>

        {/* Thẻ 2: Tỷ lệ giữ chân */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase text-orange-600 tracking-wider">Active Retention</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3,105</div>
            <p className="text-xs text-orange-500 flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3" /> 82% Engagement Rate
            </p>
          </CardContent>
        </Card>

        {/* Thẻ 3: Doanh thu trung bình */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase text-blue-600 tracking-wider">Avg. LTV</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$1,240.50</div>
            <p className="text-xs text-blue-500 flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3" /> +5.4% YoY growth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- PHẦN 3: BIỂU ĐỒ VÀ DANH SÁCH MỚI (GRID 2 CỘT KHÔNG ĐỀU) --- */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Bên trái: Giả lập biểu đồ (Chiếm 4 cột) */}
        <Card className="md:col-span-4 border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Customer Growth</CardTitle>
            <p className="text-sm text-zinc-500">New registrations vs retention over 12 months</p>
          </CardHeader>
          <CardContent className="h-75 flex items-end justify-between gap-2 pt-4">
            {/* Anh dùng tạm các cột CSS để giả lập biểu đồ cho nhanh, đỡ phải cài thư viện chart nặng nề lúc này */}
            {[40, 70, 45, 90, 65, 50, 80, 100, 75, 60, 40].map((height, i) => (
              <div key={i} className="w-full bg-zinc-100 rounded-t-sm relative group">
                <div 
                  className={`absolute bottom-0 w-full transition-all ${i === 7 ? 'bg-blue-600' : 'bg-zinc-200 group-hover:bg-zinc-300'}`} 
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bên phải: Danh sách khách hàng mới (Chiếm 3 cột) */}
        <Card className="md:col-span-3 border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Signups</CardTitle>
            <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentSignups.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-zinc-100">
                    <AvatarFallback className="bg-zinc-800 text-white text-xs">{user.initial}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.time} • {user.location}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 ${user.status === 'VIP' ? 'text-blue-600 border-blue-200' : 'text-zinc-400 border-zinc-200'}`}>
                  {user.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}