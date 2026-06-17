import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono, Libre_Baskerville } from "next/font/google";
import AuthProviderWrapper from "@/components/auth-provider-wrapper";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-editorial",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ReviewPilot - Công cụ Tải video, Affiliate & Quản lý Shop",
    template: "%s | ReviewPilot",
  },
  description:
    "ReviewPilot kết hợp website tải video công khai để kéo traffic SEO, tích hợp link affiliate Shopee, kiếm tiền qua quảng cáo và hệ thống quản lý trả phí dành cho chủ shop.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://reviewpilot.vn"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnam.variable} ${jetbrainsMono.variable} ${libreBaskerville.variable}`}>
      <body className="font-sans bg-paper text-ink antialiased">
        <AuthProviderWrapper>
          <SiteHeader />
          {children}
          <SiteFooter />
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
