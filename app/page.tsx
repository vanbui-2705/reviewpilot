import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  LineChart,
  Lock,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  TrendingDown,
  Users,
  Zap,
Loader2,
} from "lucide-react";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
import { getPlatformNews } from "@/lib/db-services";
import { DownloaderForm } from "@/components/downloader-form";
import { AdSlot } from "@/components/slots";

export const metadata = pageMetadata(
  "ReviewPilot - Tải video & Dashboard quản lý cho chủ shop",
  "ReviewPilot kết hợp website công cụ miễn phí để kéo traffic, affiliate/deal content và dashboard trả phí cho chủ shop.",
  "/"
);

/* ── Stats data (static for now — can come from API later) ── */
const STATS = [
  { label: "Video đã xử lý", value: "2.4M+", icon: Download },
  { label: "Người dùng", value: "180K+", icon: Users },
  { label: "Nền tảng hỗ trợ", value: "4", icon: Zap },
  { label: "Shop đăng ký", value: "3,200+", icon: Store },
];

const publicTools = [
  {
    icon: Download,
    title: "Tải video",
    text: "Tải video YouTube, TikTok, Facebook, Instagram miễn phí không logo.",
    href: "/tools/youtube",
  },
  {
    icon: Search,
    title: "So sánh giá",
    text: "Tìm sản phẩm, xem lịch sử giá, click affiliate và tạo dữ liệu SEO.",
    href: "/search",
  },
  {
    icon: ShoppingBag,
    title: "Deal & Affiliate",
    text: "Trang sản phẩm, blog và deal page để kéo organic traffic.",
    href: "/products",
  },
];

const shopModules = [
  { icon: Star, title: "Quản lý đánh giá", text: "Cảnh báo review xấu và gợi ý phản hồi tự động bằng AI." },
  { icon: TrendingDown, title: "Theo dõi đối thủ", text: "Theo dõi giá, voucher và biến động của shop cạnh tranh." },
  { icon: BarChart3, title: "Đơn hàng & doanh thu", text: "Gom số liệu bán hàng thành một màn hình để quản lý dễ dàng." },
  { icon: Bot, title: "Công cụ AI", text: "Viết mô tả, tiêu đề chuẩn SEO, câu trả lời review và kịch bản chăm sóc." },
];

const adminOps = [
  "Quản lý người dùng, shop và gói trả phí",
  "Theo dõi traffic public website",
  "Kiểm soát dữ liệu crawl, affiliate click và nội dung SEO",
];

/* ── Blog preview skeleton (client-fetched placeholder) ── */
function BlogPreviewSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-line/40 p-4 last:border-0">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 rounded bg-line" />
            <div className="h-4 w-3/4 rounded bg-line" />
            <div className="h-3 w-1/3 rounded bg-line" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BlogPreview({ items }: { items: Awaited<ReturnType<typeof getPlatformNews>> }) {
  if (!items?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <FileText className="h-8 w-8 text-muted/40" />
        <p className="font-mono text-xs text-muted uppercase tracking-widest">
          Chưa có bài viết nào
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {items.map((news) => (
        <a
          key={news.id}
          href={`/blog/${news.slug || "#"}`}
          className="group relative flex items-start gap-4 border-b border-line/40 p-4 transition-all hover:bg-orange-50/30 last:border-0"
        >
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2.5">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${news.color || "bg-soft text-muted"}`}>
                {news.tag}
              </span>
              <time className="text-[11px] font-medium text-muted/80">
                {new Date(news.publishedAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </time>
            </div>
            <h4 className="font-bold text-ink text-[14px] leading-snug group-hover:text-shopee transition-colors pr-6">
              {news.title}
            </h4>
          </div>
          <div className="shrink-0 pt-1 opacity-0 transition-all group-hover:opacity-100 group-hover:-translate-x-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white shadow-sm">
              <ArrowRight className="h-3.5 w-3.5 text-shopee" />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const newsItems = await getPlatformNews(4);

  return (
    <main>
      {/* ═══════════════════════════════════════════
          HERO + DOWNLOADER
      ═══════════════════════════════════════════ */}
      <section className="relative bg-[#0b1120] grid-pattern overflow-hidden">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 60%)",
          }}
        />

        <div className="relative container-page py-14 md:py-20 lg:py-24">
          {/* Label */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-amber-400">
              <Zap className="h-3.5 w-3.5" />
              Free tools → Paid Shop Dashboard
            </div>
          </div>

          {/* Headline */}
          <div className="mt-8 text-center">
            <h1 className="font-editorial text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
              Tải video,
              <br />
              <span className="text-amber-400">quản lý shop</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/50 md:text-lg">
              Dán link video vào ô bên dưới để tải ngay. Sau đó chuyển đổi thành chủ shop
              trả phí với hệ thống quản lý đánh giá, đối thủ và AI.
            </p>
          </div>

          {/* Downloader form — centered */}
          <div className="mx-auto mt-10 max-w-2xl">
            <Suspense
              fallback={
                <div className="terminal-card rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                    <span className="font-mono text-xs text-white/40">Đang nạp công cụ...</span>
                  </div>
                </div>
              }
            >
              <DownloaderForm />
            </Suspense>
          </div>

          {/* Stats row */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-center"
              >
                <stat.icon className="h-4 w-4 text-amber-400/70" />
                <span className="font-mono text-lg font-bold text-white">{stat.value}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/35">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BLOG PREVIEW
      ═══════════════════════════════════════════ */}
      <section className="border-b border-line bg-white py-14 md:py-16">
        <div className="container-page">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-extrabold uppercase tracking-wide text-shopee">Blog & Tin tức</p>
              <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">
                Xu hướng Shopee & SEO
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-shopee transition-colors hover:text-shopee/80"
            >
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* Blog list */}
            <div>
              <Suspense fallback={<BlogPreviewSkeleton />}>
                <BlogPreview items={newsItems} />
              </Suspense>
            </div>

            {/* Sidebar ad slot */}
            <aside className="hidden lg:block">
              <AdSlot label="Sidebar Ad" compact />
            </aside>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          IN-FEED AD SLOT
      ═══════════════════════════════════════════ */}
      <section className="bg-soft">
        <div className="container-page py-4">
          <AdSlot label="In-Feed Ad" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PUBLIC TOOLS
      ═══════════════════════════════════════════ */}
      <section className="border-b border-line bg-white py-14 md:py-16">
        <div className="container-page">
          <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="font-extrabold uppercase tracking-wide text-shopee">Công cụ Public</p>
              <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">
                Tăng traffic trước, bán Dashboard sau
              </h2>
            </div>
            <Link
              href="/search"
              className="text-sm font-extrabold text-shopee transition-colors hover:text-shopee/80"
            >
              Trải nghiệm so sánh giá <ArrowRight className="inline h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {publicTools.map((tool) => (
              <Link key={tool.title} href={tool.href} className="group card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-shopee/5 text-shopee transition-colors group-hover:bg-shopee group-hover:text-white">
                  <tool.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-extrabold">{tool.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{tool.text}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-shopee opacity-0 transition-opacity group-hover:opacity-100">
                  <span>Dùng ngay</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA: DỊCH VỤ CHO CHỦ SHOP
      ═══════════════════════════════════════════ */}
      <section className="relative bg-ink overflow-hidden">
        {/* Texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative container-page grid gap-10 py-16 md:py-20 lg:grid-cols-2 lg:items-center">
          {/* Left copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-amber-400">
              <Store className="h-3.5 w-3.5" />
              Cho chủ Shop Online
            </div>
            <h2 className="mt-6 font-editorial text-3xl font-bold leading-tight text-white md:text-4xl">
              Quản lý shop thông minh,
              <br />
              <span className="text-amber-400">đánh giá & đối thủ</span>
              <br />
              trong một màn hình
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/55">
              Dashboard trả phí dành riêng cho chủ shop: cảnh báo review xấu, theo dõi giá đối thủ,
              AI hỗ trợ viết mô tả và trả lời khách — tất cả trong giao diện duy nhất.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/pricing"
                className="btn-primary px-6 py-3.5 bg-amber-500 text-black hover:bg-amber-400"
              >
                Xem bảng giá
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dich-vu"
                className="btn-outline border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10"
              >
                Tìm hiểu thêm
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-white/35 font-mono">
              <CheckCircle2 className="h-3.5 w-3.5 text-terminal-green" />
              <span>Dùng thử 7 ngày miễn phí — không cần thẻ</span>
            </div>
          </div>

          {/* Right: feature cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            {shopModules.map((module) => (
              <div
                key={module.title}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors hover:border-amber-500/20 hover:bg-white/[0.05]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <module.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-3 font-extrabold text-white text-[15px]">{module.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/45">{module.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BOTTOM AD SLOT
      ═══════════════════════════════════════════ */}
      <section className="bg-soft">
        <div className="container-page py-6">
          <AdSlot label="Leaderboard Ad" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ADMIN CONSOLE
      ═══════════════════════════════════════════ */}
      <section className="bg-[#0a0f1d] py-14 md:py-16">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">
              <Lock className="h-3 w-3" />
              Internal Use Only
            </div>
            <h2 className="mt-5 font-mono text-2xl font-bold text-white md:text-3xl">
              Admin Console
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/40">
              Khu vực quản trị riêng của đội vận hành. Bảo mật hoàn toàn khỏi shop dashboard.
              Quản lý người dùng, cửa hàng, gói dịch vụ, crawl dữ liệu và sức khỏe hệ thống.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-lg space-y-2">
            {adminOps.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 font-mono text-sm text-white/60"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/60" />
                {item}
              </div>
            ))}
            <Link
              href="/admin"
              className="mt-4 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-amber-400/70 transition-colors hover:text-amber-400"
            >
              Vào hệ thống quản trị <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
