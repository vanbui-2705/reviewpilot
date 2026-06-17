"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const navLinks = [
  { href: "/", label: "Trang chủ" },
  {
    label: "Công cụ",
    href: "/try",
    children: [
      { href: "/try", label: "Tải video & Cào Shopee" },
      { href: "/tools/youtube", label: "YouTube Downloader" },
      { href: "/tools/tiktok", label: "TikTok Downloader" },
      { href: "/tools/facebook", label: "Facebook Downloader" },
      { href: "/tools/instagram", label: "Instagram Downloader" },
    ],
  },
  {
    label: "Sản phẩm & Giá",
    href: "/products",
    children: [
      { href: "/products", label: "So sánh giá điện thoại" },
      { href: "/search", label: "Tìm kiếm sản phẩm" },
      { href: "/price-alerts", label: "Cảnh báo giá" },
      { href: "/deals", label: "Deal khuyến mãi" },
    ],
  },
  {
    label: "Dashboard Shop",
    href: "/dashboard",
    children: [
      { href: "/dashboard", label: "Tổng quan" },
      { href: "/dashboard/reviews", label: "Quản lý đánh giá" },
      { href: "/dashboard/orders", label: "Đơn hàng" },
      { href: "/dashboard/inventory", label: "Tồn kho" },
      { href: "/dashboard/competitors", label: "Theo dõi đối thủ" },
      { href: "/dashboard/listing", label: "Đăng sản phẩm" },
      { href: "/dashboard/ai-tools", label: "Công cụ AI" },
    ],
  },
  { href: "/pricing", label: "Bảng giá" },
];

type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

function DropdownItem({ link }: { link: NavItem }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isActive =
    pathname === link.href ||
    pathname.startsWith(link.href + "/") ||
    link.children?.some((child) => pathname === child.href || pathname.startsWith(child.href + "/"));

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!link.children) {
    return (
      <Link
        href={link.href}
        prefetch
        className={`relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
          isActive ? "text-ink" : "text-muted hover:bg-soft hover:text-ink"
        }`}
      >
        {isActive && <span className="absolute inset-x-1 -bottom-0.5 h-[3px] rounded-full bg-shopee" />}
        {link.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
          isActive ? "text-ink" : "text-muted hover:bg-soft hover:text-ink"
        }`}
      >
        {link.label}
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-xl border border-line bg-white shadow-panel">
          {link.children.map((child) => {
            const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
            return (
              <Link
                key={child.href}
                href={child.href}
                prefetch
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors ${
                  childActive ? "bg-shopee/5 font-extrabold text-shopee" : "text-muted hover:bg-soft hover:text-ink"
                }`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${childActive ? "bg-shopee" : "bg-transparent"}`} />
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function NavInner() {
  const router = useRouter();

  useEffect(() => {
    navLinks.forEach((link) => {
      router.prefetch(link.href);
      link.children?.forEach((child) => router.prefetch(child.href));
    });
  }, [router]);

  return (
    <nav className="hidden items-center gap-0.5 text-sm lg:flex">
      {navLinks.map((link) => (
        <DropdownItem key={link.href} link={link as NavItem} />
      ))}
    </nav>
  );
}
