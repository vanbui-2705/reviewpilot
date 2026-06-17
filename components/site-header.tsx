"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LoginButton from "@/components/login-button";
import { NavInner } from "@/components/nav-inner";
import { Download } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] items-center justify-between gap-5 py-3">
        {/* Logo */}
        <Link href="/" prefetch className="flex items-center gap-2.5 font-extrabold tracking-tight text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-shopee text-white shadow-sm">
            R
          </span>
          <span className="text-lg">ReviewPilot</span>
        </Link>

        {/* Nav */}
        <NavInner />

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/try"
            className="hidden items-center gap-1.5 rounded-lg bg-shopee px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-shopee/90 active:scale-[0.97] md:inline-flex"
          >
            <Download className="h-4 w-4" />
            <span>Tải video</span>
          </Link>
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
