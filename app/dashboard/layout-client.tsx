"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  Boxes,
  LayoutDashboard,
  MessageSquareText,
  PackagePlus,
  Settings,
  ShieldCheck,
  Store,
  TrendingDown,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/dashboard" },
  { icon: MessageSquareText, label: "Review Monitor", href: "/dashboard/reviews" },
  { icon: ShieldCheck, label: "Đơn hàng", href: "/dashboard/orders" },
  { icon: Store, label: "Đối thủ", href: "/dashboard/competitors" },
  { icon: Boxes, label: "Kho hàng", href: "/dashboard/inventory" },
  { icon: PackagePlus, label: "Đăng sản phẩm", href: "/dashboard/listing" },
  { icon: Bot, label: "AI Tools", href: "/dashboard/ai-tools" },
  { icon: Settings, label: "Cài đặt", href: "/dashboard/settings" },
];

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-soft">
      <header className="border-b border-line bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] items-center justify-between py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-extrabold text-ink">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-shopee text-white text-sm">R</span>
            Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">Starter Plan</span>
            <Link href="/" className="text-sm font-bold text-muted hover:text-ink transition-colors">Về trang chủ</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] gap-6 py-6">
        <aside className="w-52 shrink-0">
          <nav className="grid gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all duration-150 relative ${
                    active ? "bg-shopee/10 text-shopee" : "text-muted hover:bg-white hover:text-ink"
                  }`}
                >
                  {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-shopee" />}
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-xl border border-dashed border-line bg-white/60 p-4">
            <p className="text-xs font-extrabold text-muted uppercase tracking-wide">Token còn lại</p>
            <p className="mt-1 text-2xl font-extrabold text-ink" id="token-display">2,450</p>
            <div className="mt-2 h-1.5 rounded-full bg-soft">
              <div className="h-1.5 rounded-full bg-shopee" style={{ width: "49%" }} />
            </div>
            <p className="mt-1.5 text-xs text-muted">5,000 / tháng</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
