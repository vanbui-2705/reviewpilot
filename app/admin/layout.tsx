"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  FileText,
  Globe,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";

const navItems = [
  { icon: BarChart3, label: "Tổng quan", href: "/admin" },
  { icon: Users, label: "Người dùng", href: "/admin/users" },
  { icon: Store, label: "Cửa hàng", href: "/admin/shops" },
  { icon: ShoppingBag, label: "Sản phẩm", href: "/admin/products" },
  { icon: Globe, label: "Bài viết", href: "/admin/articles" },
  { icon: LayoutDashboard, label: "Đơn hàng", href: "/admin/orders" },
  { icon: Settings, label: "Cài đặt", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-soft">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-[min(1400px,calc(100%-32px))] items-center justify-between gap-4 py-3">
          <Link href="/admin" className="flex items-center gap-3 font-extrabold text-ink">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-shopee text-white">R</span>
            <span>
              <span className="block leading-tight text-lg">ReviewPilot Admin</span>
              <span className="block text-xs font-bold text-muted">Trung tâm điều hành</span>
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <label className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                placeholder="Tìm người dùng, sản phẩm, bài viết, đơn hàng..."
                className="focus-ring w-full rounded-lg border border-line bg-soft py-2.5 pl-10 pr-3 text-sm transition-colors focus:bg-white"
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-muted hover:text-shopee hover:border-shopee/30 transition-colors" aria-label="Thông báo">
              <Bell className="h-5 w-5" />
            </button>
            <Link href="/" className="hidden rounded-lg border border-line px-4 py-2 text-sm font-extrabold text-muted hover:bg-ink hover:text-white hover:border-ink transition-colors sm:inline-flex">
              Về website
            </Link>
            <div className="hidden items-center gap-2 rounded-lg bg-shopee px-4 py-2 text-white md:flex shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-extrabold">Quản trị viên</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-[min(1400px,calc(100%-32px))] gap-6 py-6 lg:grid-cols-[250px_1fr]">
        <aside className="lg:sticky lg:top-[86px] lg:h-[calc(100vh-110px)] flex flex-col gap-4">
          <nav className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-white p-3 shadow-sm sm:grid-cols-3 lg:grid-cols-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition-all ${
                    isActive ? "bg-shopee text-white shadow-md shadow-orange-500/20" : "text-muted hover:bg-soft hover:text-ink"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden rounded-xl border border-line bg-white p-5 shadow-sm lg:block">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <FileText className="h-5 w-5 text-shopee" />
              <h2 className="text-sm font-extrabold text-ink">Danh sách cần làm (Hôm nay)</h2>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-muted font-medium">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-shopee"></span>
                <span className="text-ink font-bold">12</span> khách hàng cần gọi lại
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span className="text-ink font-bold">4</span> tiến trình crawl bị lỗi
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ocean"></span>
                <span className="text-ink font-bold">3</span> bài viết SEO đang nháp
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 pb-10">{children}</main>
      </div>
    </div>
  );
}
