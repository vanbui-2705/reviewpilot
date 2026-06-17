import { ProductSearchCompare } from "@/components/product-search-compare";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Tìm và so sánh giá sản phẩm - ReviewPilot",
  "Tìm sản phẩm, so sánh giá Shopee, Lazada, Tiki và click affiliate từ ReviewPilot.",
  "/search",
);

export default function SearchPage() {
  return (
    <main className="bg-soft py-14">
      <div className="container-page">
        <section className="mb-8">
          <p className="font-extrabold uppercase tracking-wide text-shopee">Product search</p>
          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">Tìm sản phẩm và so sánh giá</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Nhập tên sản phẩm để xem giá, sàn, shop, rating và link mua. Dữ liệu crawl thật từ Shopee Public API.
          </p>
        </section>
        <ProductSearchCompare />
      </div>
    </main>
  );
}
