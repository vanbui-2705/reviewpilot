"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MessageCircle } from "lucide-react";

export function SiteFooter() {
  const pathname = usePathname();

  // Ẩn footer chung ở trang admin và dashboard
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="border-t border-line bg-soft">
      <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col justify-between gap-6 py-10 text-sm text-muted md:flex-row">
        <div>
          <div className="mb-2 font-extrabold text-ink">ReviewPilot</div>
          <p className="max-w-md leading-relaxed">
            Hệ thống cung cấp công cụ miễn phí giúp thu hút traffic SEO, đồng thời cung cấp giải pháp quản lý mạnh mẽ và gia tăng doanh thu qua mô hình trả phí và affiliate.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-semibold text-ink">
          <Link href="/tools/youtube" className="transition-colors hover:text-shopee">YouTube</Link>
          <Link href="/tools/tiktok" className="transition-colors hover:text-shopee">TikTok</Link>
          <Link href="/affiliate" className="transition-colors hover:text-shopee">Shopee Affiliate</Link>
          <Link href="/dashboard" className="transition-colors hover:text-shopee">Dashboard</Link>
          <Link href="https://zalo.me/" className="transition-colors hover:text-shopee">Zalo</Link>
          <Link href="mailto:support@reviewpilot.vn" className="transition-colors hover:text-shopee">Gmail</Link>
        </div>
      </div>
    </footer>
  );
}
