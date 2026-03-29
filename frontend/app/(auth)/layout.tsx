import type { ReactNode } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Bảo mật rõ ràng",
    description: "Phân quyền admin và khách hàng mạch lạc, đăng nhập an toàn hơn.",
  },
  {
    icon: Sparkles,
    title: "Biểu mẫu dễ dùng",
    description: "Giao diện gọn gàng, thao tác nhanh trên desktop lẫn điện thoại.",
  },
  {
    icon: PackageCheck,
    title: "Theo dõi mua sắm",
    description: "Đăng ký nhanh để quản lý đơn hàng, địa chỉ và lịch sử mua hàng.",
  },
];

const quickStats = [
  { label: "Tài khoản", value: "Đăng ký nhanh" },
  { label: "Quản trị", value: "Đăng nhập gọn" },
  { label: "Thiết bị", value: "Desktop + Mobile" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,#f8fafc_0%,#e0f2fe_48%,#fef3c7_100%)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.18),transparent_32%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/72 shadow-[0_30px_120px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        <div className="grid flex-1 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="relative hidden overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.35),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.22),transparent_28%)]" />

            <div className="relative space-y-8">
              <Link
                href="/"
                className="inline-flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-white text-slate-950">
                  SG
                </span>
                Shop Giày Sneaker
              </Link>

              <div className="space-y-4">
                <span className="inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                  Không gian tài khoản mới
                </span>
                <h1 className="max-w-xl text-4xl font-semibold leading-tight text-balance">
                  Thiết kế đăng nhập và đăng ký sáng sủa, mượt mà, đủ nổi bật cho một cửa hàng sneaker hiện đại.
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-300">
                  Khu vực tài khoản được tối ưu lại để người dùng mới đăng ký nhanh hơn,
                  quản trị viên vào hệ thống gọn hơn và toàn bộ nội dung tiếng Việt hiển thị
                  chuẩn dấu.
                </p>
              </div>

              <div className="grid gap-4">
                {highlights.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-sm"
                  >
                    <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/14 text-cyan-100">
                      <Icon className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-white">{title}</p>
                      <p className="text-sm leading-6 text-slate-300">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-[1.75rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-cyan-100">
                <BadgeCheck className="size-4" />
                Luồng xác thực trực quan hơn
              </div>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-200">
                Bố cục mới giúp người dùng nhìn rõ thông tin cần nhập, trạng thái lỗi và
                đường dẫn chuyển đổi giữa đăng nhập với đăng ký mà không bị rối mắt.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {quickStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center p-4 sm:p-6 lg:p-12">
            <div className="w-full max-w-lg">
              <div className="mb-5 rounded-[1.75rem] border border-white/80 bg-white/82 p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.5)] backdrop-blur lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                    SG
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Shop Giày Sneaker</p>
                    <p className="text-sm text-slate-500">
                      Khu vực tài khoản tối ưu cho đăng nhập và đăng ký.
                    </p>
                  </div>
                </div>
              </div>

              {children}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
