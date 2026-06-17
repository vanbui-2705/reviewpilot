import { DownloaderForm } from "@/components/downloader-form";
import { ShopeeSearchForm } from "@/components/shopee-search-form";
import { pageMetadata } from "@/lib/seo";
import { Download, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = pageMetadata(
  "Công cụ miễn phí — Tải video & Cào dữ liệu Shopee",
  "Tải video YouTube TikTok Facebook miễn phí. Cào dữ liệu sản phẩm Shopee thực tế: giá, tồn kho, đánh giá, lượt bán.",
  "/try"
);

export default function TryPage() {
  return (
    <main className="bg-soft min-h-screen pb-24">
      {/* Hero */}
      <section className="bg-white border-b border-line py-14">
        <div className="container-page text-center">
          <span className="inline-block rounded-full bg-shopee/10 px-4 py-1.5 text-sm font-extrabold text-shopee mb-4">
            Công cụ miễn phí
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
            Bộ công cụ ReviewPilot
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted leading-relaxed">
            Tải video chất lượng cao từ mọi nền tảng. Tra cứu và cào dữ liệu
            sản phẩm Shopee ngay lập tức — không cần đăng ký.
          </p>
        </div>
      </section>

      <div className="container-page mt-10 grid gap-8 lg:grid-cols-2">
        {/* ── Video Downloader ─────────────────────────────── */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-shopee text-white shadow-sm shadow-shopee/30">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-ink">Tải video</h2>
              <p className="text-sm text-muted">YouTube · TikTok · Facebook · Instagram</p>
            </div>
          </div>
          <DownloaderForm />
          <p className="text-center text-xs text-muted">
            Hỗ trợ chất lượng tới 1080p. File xử lý ngay, không lưu trữ.
          </p>
        </div>

        {/* ── Shopee Crawler ───────────────────────────────── */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 text-white shadow-sm shadow-orange-500/30">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-ink">Cào dữ liệu Shopee</h2>
              <p className="text-sm text-muted">Giá · Tồn kho · Đánh giá · Lượt bán</p>
            </div>
          </div>
          <ShopeeSearchForm />
          <p className="text-center text-xs text-muted">
            Dữ liệu thực tế trực tiếp từ Shopee. Cập nhật theo thời gian thực.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="container-page mt-14">
        <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-extrabold text-ink">
            Muốn quản lý toàn bộ cửa hàng Shopee?
          </h2>
          <p className="mt-2 text-muted max-w-xl mx-auto">
            Nâng cấp lên gói trả phí để theo dõi review xấu, đối thủ cạnh tranh,
            tồn kho và nhận cảnh báo thông minh ngay khi có biến động.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link href="/pricing" className="btn-primary px-8 py-3.5 text-base">
              Xem bảng giá
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/dashboard" className="btn-outline px-8 py-3.5 text-base">
              Vào Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
