"use client";

import { useAuth } from "@/components/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LoginButton() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="h-9 w-20 animate-pulse rounded-lg bg-soft" />;
  }

  if (!user) {
    if (pathname === "/login") return null;
    return (
      <Link href="/login" className="btn-primary text-sm">
        Đăng nhập
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm font-bold text-muted sm:inline">
        {user.name} <span className="text-xs text-shopee">({user.role === "shop" ? "Shop" : user.role === "admin" ? "Admin" : "Trial"})</span>
      </span>
      {user.role === "free" && user.trialCrawlsLeft !== undefined && (
        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-extrabold text-shopee">
          {user.trialCrawlsLeft} crawl
        </span>
      )}
      <button onClick={logout} className="rounded-lg border border-line px-3 py-2 text-sm font-bold text-muted hover:text-ink hover:border-ink/30 transition-colors">
        Đăng xuất
      </button>
    </div>
  );
}
