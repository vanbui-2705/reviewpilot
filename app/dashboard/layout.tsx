"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Bot,
  Boxes,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  Rocket,
  Settings,
  ShoppingCart,
  Star,
  Users,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/dashboard" },
  { icon: Star, label: "Quản lý đánh giá", href: "/dashboard/reviews" },
  { icon: ShoppingCart, label: "Đơn hàng", href: "/dashboard/orders" },
  { icon: Users, label: "Đối thủ", href: "/dashboard/competitors" },
  { icon: Boxes, label: "Kho hàng", href: "/dashboard/inventory" },
  { icon: PackagePlus, label: "Đăng sản phẩm", href: "/dashboard/listing" },
  { icon: Bot, label: "Công cụ AI", href: "/dashboard/ai-tools" },
  { icon: Settings, label: "Cài đặt shop", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    navItems.forEach((item) => router.prefetch(item.href));
  }, [router]);

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#f4f7fa]">
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-line/60 bg-white">
        <div className="p-6">
          <Link href="/dashboard" prefetch className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-shopee text-white shadow-sm shadow-shopee/30">
              <Rocket className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-extrabold leading-tight text-ink">Shop Demo</span>
              <span className="block text-xs font-medium text-muted/80">shop@reviewpilot.vn</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all ${
                  isActive ? "bg-shopee text-white shadow-md shadow-shopee/20" : "text-muted hover:bg-soft/80 hover:text-ink"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-line/40 p-4">
          <Link
            href="/help"
            prefetch
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted transition-all hover:bg-soft/80 hover:text-ink"
          >
            <HelpCircle className="h-4 w-4" />
            Trợ giúp
          </Link>
          <Link
            href="/logout"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted transition-all hover:bg-soft/80 hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
