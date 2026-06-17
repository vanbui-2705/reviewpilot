import Link from "next/link";
import { LeadForm } from "@/components/lead-form";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Dịch vụ cho chủ shop Shopee - Review Monitor và Price Tracker",
  "Landing page dịch vụ cho chủ shop: theo dõi review xấu, giá đối thủ, tồn kho và báo cáo tự động.",
  "/dich-vu"
);

export default function ServicePage() {
  return (
    <main>
      <section className="page-band py-16">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="font-extrabold uppercase tracking-wide text-shopee">Dịch vụ cho shop</p>
            <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">Theo dõi review xấu và giá đối thủ tự động</h1>
            <p className="mt-5 text-lg text-muted">Gói dịch vụ bán ngay cho chủ shop: setup 1 lần, dùng thử 7 ngày, cảnh báo qua Zalo/Email.</p>
            <Link href="/pricing" className="mt-6 inline-flex rounded-ui bg-ink px-5 py-3 font-extrabold text-white">Xem bảng giá</Link>
          </div>
          <LeadForm />
        </div>
      </section>
      <section className="py-16">
        <div className="container-page grid gap-5 md:grid-cols-3">
          {[
            ["Review Monitor", "Crawl review mới, phân loại tiêu cực và gợi ý trả lời."],
            ["Competitor Tracker", "Theo dõi giá đối thủ, cảnh báo khi họ giảm giá."],
            ["Weekly Report", "Gửi báo cáo rating, đơn hàng, tồn kho hằng tuần."]
          ].map(([title, text]) => (
            <div key={title} className="card p-6">
              <h2 className="text-xl font-extrabold">{title}</h2>
              <p className="mt-3 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
