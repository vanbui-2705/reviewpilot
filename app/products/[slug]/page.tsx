import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, Star, TrendingDown, ShieldCheck, ChevronRight } from "lucide-react";
import { PriceChart } from "@/components/price-chart";
import { PriceComparison } from "@/components/price-comparison";
import { ProductCard } from "@/components/product-card";
import {
  getProductBySlugService,
  getRelatedProductsService,
} from "@/lib/product-service";
import { formatVnd, getLowestOffer, type Product } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

type Props = { params: { slug: string } };

// ── SEO Metadata (SSR) ──────────────────────────────────────────────

export async function generateStaticParams() {
  // For static export — will use fallback: 'blocking' in Next config
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlugService(params.slug);
  if (!product) return { title: "Không tìm thấy", description: "" };

  const lowest = getLowestOffer(product);
  const marketplaces = product.offers.length > 0
    ? product.offers.map((o: Product["offers"][number]) => o.marketplace).join(", ")
    : "các sàn";
  const title = `${product.name} — So sánh giá ${product.brand} | ReviewPilot`;
  const description =
    `${product.name} đang có giá từ ${formatVnd(lowest.price)}. ` +
    `So sánh giá ${marketplaces} — ` +
    `${product.shortDescription.slice(0, 120)}`;

  return pageMetadata(title, description, `/products/${product.slug}`);
}

// ── Product Detail Page (RSC) ───────────────────────────────────────

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProductBySlugService(params.slug);
  if (!product) notFound();

  const lowest = getLowestOffer(product);
  const highest = [...product.offers].sort((a, b) => b.price - a.price)[0];
  const saving = highest?.price ? highest.price - lowest.price : 0;

  const related = await getRelatedProductsService(params.slug, 3);

  // ── JSON-LD Product Structured Data ────────────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.imageUrl,
    description: product.shortDescription,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: lowest.price,
      highPrice: highest?.price || lowest.price,
      priceCurrency: "VND",
      offerCount: product.offers.length,
      offers: product.offers.map((o: Product["offers"][number]) => ({
        "@type": "Offer",
        price: o.price,
        priceCurrency: "VND",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: o.shopName,
        },
      })),
    },
  };

  return (
    <main className="min-h-screen bg-soft">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <nav className="border-b border-line bg-white">
        <div className="container-page py-3">
          <ol className="flex items-center gap-2 text-sm text-muted">
            <li>
              <Link href="/" className="hover:text-shopee">Trang chủ</Link>
            </li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li>
              <Link href="/products" className="hover:text-shopee">Sản phẩm</Link>
            </li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li>
              <Link
                href={`/products?brand=${encodeURIComponent(product.brand)}`}
                className="hover:text-shopee"
              >
                {product.brand}
              </Link>
            </li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li className="font-extrabold text-ink truncate max-w-[200px]">{product.name}</li>
          </ol>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="border-b border-line bg-white">
        <div className="container-page py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-2xl bg-soft shadow-lg">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Condition badge */}
              <div className="absolute top-4 right-4 rounded-xl bg-ink/80 px-3 py-1.5 text-sm font-extrabold text-white backdrop-blur-sm">
                {product.condition}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-ocean/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-ocean">
                  {product.brand}
                </span>
                <span className="text-sm text-muted">{product.model}</span>
                <span className="text-sm text-muted">·</span>
                <span className="text-sm text-muted">{product.storage}</span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold md:text-4xl lg:text-5xl leading-tight">
                {product.name}
              </h1>

              <p className="mt-4 max-w-2xl text-base text-muted leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Stats grid */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard
                  label="Giá từ"
                  value={formatVnd(lowest.price)}
                  accent="text-shopee"
                />
                <StatCard
                  label="Sàn bán"
                  value={`${product.offers.length} nền tảng`}
                />
                <StatCard
                  label="Tiết kiệm"
                  value={saving > 0 ? formatVnd(saving) : "—"}
                  accent="text-leaf"
                />
                <StatCard
                  label="Dung lượng"
                  value={product.storage}
                />
              </div>

              {/* CTA */}
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={lowest.affiliateUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="inline-flex items-center gap-2 rounded-xl bg-shopee px-6 py-4 font-extrabold text-white shadow-lg shadow-shopee/25 transition-all hover:bg-shopee/90 hover:shadow-xl hover:shadow-shopee/30 hover:-translate-y-0.5"
                >
                  Mua {formatVnd(lowest.price)}
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href={lowest.affiliateUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-white px-6 py-4 font-extrabold text-ink transition-colors hover:bg-soft"
                >
                  <ExternalLink className="h-5 w-5" />
                  Xem trên {lowest.marketplace}
                </a>
              </div>

              {/* Trust badges */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-leaf" />
                  Giá cập nhật real-time
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Rating {lowest.rating.toFixed(1)}
                </span>
                <span>Đã bán {lowest.sold.toLocaleString("vi-VN")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Price Comparison ───────────────────────────────────── */}
      <section className="py-10 md:py-14">
        <div className="container-page space-y-8">
          <PriceComparison product={product} />

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Price Chart */}
            {product.priceHistory.length > 0 ? (
              <PriceChart product={product} />
            ) : (
              <div className="card flex items-center justify-center py-20 text-muted">
                <p>Biểu đồ giá sẽ hiển thị sau khi có dữ liệu crawl lịch sử.</p>
              </div>
            )}

            {/* Specs Sidebar */}
            <SpecsSidebar specs={product.specs} />
          </div>

          {/* FAQ */}
          {product.faqs.length > 0 && (
            <div className="card p-6 md:p-8">
              <h2 className="text-xl font-extrabold">
                Câu hỏi thường gặp về {product.name}
              </h2>
              <div className="mt-6 space-y-3">
                {product.faqs.map((faq: { question: string; answer: string }, i: number) => (
                  <details
                    key={i}
                    className="group rounded-xl border border-line overflow-hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-extrabold hover:bg-soft transition-colors">
                      {faq.question}
                      <ChevronRight className="h-5 w-5 text-muted transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="border-t border-line bg-soft/50 px-4 py-4 text-muted">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Related Products */}
          {related.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold">
                  Sản phẩm tương tự từ {product.brand}
                </h2>
                <Link
                  href={`/products?brand=${encodeURIComponent(product.brand)}`}
                  className="inline-flex items-center gap-1 text-sm font-extrabold text-shopee hover:underline"
                >
                  Xem tất cả
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

// ── Sub-Components ──────────────────────────────────────────────────

function StatCard({ label, value, accent = "" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className={`mt-1 text-lg font-extrabold truncate ${accent}`}>{value}</div>
    </div>
  );
}

function SpecsSidebar({
  specs,
}: {
  specs: Record<string, string>;
}) {
  const entries = Object.entries(specs).filter(
    ([, v]) => v && v !== "Đang cập nhật"
  );

  if (entries.length === 0) {
    return (
      <div className="card p-6 text-center text-muted">
        Chưa có thông tin cấu hình chi tiết.
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-extrabold">Cấu hình chi tiết</h2>
      <dl className="mt-5 space-y-0">
        {entries.map(([key, value], i) => (
          <div
            key={key}
            className={`flex justify-between gap-4 py-3 text-sm ${
              i > 0 ? "border-t border-line" : ""
            }`}
          >
            <dt className="font-bold uppercase text-muted">{key}</dt>
            <dd className="text-right font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
