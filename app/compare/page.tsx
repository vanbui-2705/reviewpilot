import { ProductSearchCompare } from "@/components/product-search-compare";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "So sánh giá Shopee Lazada Tiki - ReviewPilot",
  "So sánh offer sản phẩm trên nhiều sàn và tìm nơi có giá tốt nhất.",
  "/compare",
);

export default function ComparePage() {
  return (
    <main className="bg-soft py-14">
      <div className="container-page">
        <section className="mb-8">
          <p className="font-extrabold uppercase tracking-wide text-ocean">Compare</p>
          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">So sánh giá trên nhiều sàn</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Dùng cho người mua tìm giá tốt và tạo traffic affiliate cho ReviewPilot.
          </p>
        </section>
        <ProductSearchCompare initialQuery="iphone 13" />
      </div>
    </main>
  );
}
