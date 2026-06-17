import { AffiliateGrid } from "@/components/affiliate-grid";
import { AdSlot } from "@/components/slots";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Shopee Affiliate - Gợi ý sản phẩm và tracking click",
  "Trang gợi ý sản phẩm có thể thay bằng link Shopee Affiliate thật, tracking click và nội dung SEO cho intent mua hàng.",
  "/affiliate"
);

export default function AffiliatePage() {
  return (
    <main>
      <section className="page-band py-16">
        <div className="container-page">
          <p className="font-extrabold uppercase tracking-wide text-shopee">Shopee affiliate</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-extrabold md:text-5xl">Khu sản phẩm kiếm hoa hồng từ người dùng bấm mua</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">Thay `affiliateUrl` bằng link tiếp thị thật. Mỗi click được gửi về `/api/affiliate/click` để sau này lưu analytics.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container-page">
          <AdSlot label="Top banner affiliate page" />
          <div className="mt-6">
            <AffiliateGrid />
          </div>
        </div>
      </section>
    </main>
  );
}
