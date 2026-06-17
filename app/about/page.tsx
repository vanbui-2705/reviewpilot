import Link from "next/link";
import { Shield, type LucideIcon } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Về ReviewPilot - Nền tảng kiếm tiền số",
  "ReviewPilot kết hợp downloader công cộng, affiliate và dashboard trả phí cho chủ shop.",
  "/about"
);

const values: Array<[LucideIcon, string, string]> = [
  [Shield, "Minh bạch", "Không giấu giếm phí ẩn, giá rõ từng gói."],
  [Shield, "Tự chủ", "Bạn có thể tự host toàn bộ hệ thống nếu muốn."],
  [Shield, "Tốc độ", "API được tối ưu cho thị trường Việt Nam, CDN gần."],
];

export default function AboutPage() {
  return (
    <main>
      <section className="page-band py-16">
        <div className="container-page max-w-3xl">
          <p className="font-extrabold uppercase tracking-wide text-shopee">Giới thiệu</p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">Nền tảng kiếm tiền số cho chủ shop</h1>
          <p className="mt-5 text-lg text-muted">
            ReviewPilot là dự án kết hợp 3 kênh thu nhập: traffic công cộng (downloader + SEO blog),
            affiliate sản phẩm Shopee, và dashboard trả phí cho chủ shop quản lý kinh doanh.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="grid gap-6">
            <h2 className="text-2xl font-extrabold">Cách hoạt động</h2>
            <div className="grid gap-4">
              {[
                {
                  title: "1. Public downloader kéo traffic",
                  body: "Công cụ tải video YouTube, TikTok, Facebook, Instagram được tối ưu SEO từ khóa. Traffic tự nhiên từ Google đến mỗi ngày.",
                },
                {
                  title: "2. Quảng cáo + Ad Gate",
                  body: "Người dùng xem quảng cáo hoặc đếm ngược trước khi tải file. Đây là nguồn thu nhập chính từ traffic công cộng.",
                },
                {
                  title: "3. Shopee Affiliate",
                  body: "Bài SEO và trang affiliate gợi ý sản phẩm phù hợp chủ shop. Hoa hồng 4-10% mỗi đơn hàng qua link tracking.",
                },
                {
                  title: "4. Dashboard trả phí",
                  body: "Chủ shop cần công cụ quản lý: theo dõi review xấu, cảnh báo đối thủ, tồn kho, AI tools. Gói từ 200k/tháng.",
                },
              ].map((step) => (
                <div key={step.title} className="card p-5">
                  <h3 className="font-extrabold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold">Giá trị cốt lõi</h2>
            <div className="mt-5 grid gap-4">
              {values.map(([Icon, title, desc]) => (
                <div key={title} className="card p-5">
                  <Icon className="mb-3 h-6 w-6 text-shopee" />
                  <div className="font-extrabold">{title}</div>
                  <p className="mt-1 text-sm text-muted">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 card p-6">
              <h3 className="font-extrabold">Muốn hợp tác?</h3>
              <p className="mt-2 text-sm text-muted">
                Chúng tôi mở cơ hội affiliate, white-label và revenue share cho đối tác có traffic.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-2 rounded-ui bg-shopee px-5 py-3 text-sm font-extrabold text-white"
              >
                Liên hệ hợp tác
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
