"use client";

import { useMemo, useState } from "react";
import { Clock, ExternalLink, PackageCheck, Search, ShoppingBag, Sparkles, Star, TrendingDown } from "lucide-react";
import type { MarketSearchOffer } from "@/lib/market-search";

type CompareResult = {
  ok: boolean;
  error?: string;
  query?: string;
  mode?: "shopee-api" | "playwright";
  totalOffers?: number;
  lowest?: MarketSearchOffer;
  highest?: MarketSearchOffer;
  saving?: number;
  offers?: MarketSearchOffer[];
  crawledAt?: string;
  note?: string;
};

function formatVnd(value = 0) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

function formatTime(value?: string) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(value));
}

function marketplaceClass(marketplace: MarketSearchOffer["marketplace"]) {
  if (marketplace === "Shopee") return "bg-orange-50 text-shopee ring-orange-100";
  if (marketplace === "Lazada") return "bg-blue-50 text-ocean ring-blue-100";
  return "bg-green-50 text-leaf ring-green-100";
}

export function ProductSearchCompare({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);

  const sortedOffers = useMemo(() => [...(result?.offers || [])].sort((a, b) => a.price - b.price), [result?.offers]);
  const heroOffer = sortedOffers[0];

  async function searchProduct(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (query.trim().length < 2) return;

    setLoading(true);
    const response = await fetch("/api/search/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const payload = await response.json();
    setResult(payload);
    setLoading(false);
  }

  async function trackClick(offer: MarketSearchOffer) {
    await fetch("/api/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: offer.id, marketplace: offer.marketplace, url: offer.affiliateUrl })
    });
  }

  return (
    <div className="overflow-hidden rounded-ui border border-line bg-white shadow-panel">
      <div className="border-b border-line bg-soft p-4 md:p-5">
        <form onSubmit={searchProduct} className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="relative">
            <span className="sr-only">Nhập sản phẩm cần crawl dữ liệu</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nhập sản phẩm: iPhone 13 cũ, Galaxy S23, laptop cũ, tai nghe bluetooth..."
              className="focus-ring w-full rounded-ui border-line bg-white py-4 pl-12 pr-4"
            />
          </label>
          <button
            disabled={loading}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-ui bg-shopee px-6 py-4 font-extrabold text-white disabled:opacity-60"
          >
            <Sparkles className="h-5 w-5" />
            {loading ? "Đang crawl" : "Crawl dữ liệu"}
          </button>
        </form>
      </div>

      {result?.error ? <div className="m-5 rounded-ui bg-red-50 p-4 text-sm font-bold text-red-700">{result.error}</div> : null}

      {loading ? (
        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_1.25fr]">
          <div className="h-64 animate-pulse rounded-ui bg-soft" />
          <div className="grid gap-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-ui bg-soft" />
            ))}
          </div>
        </div>
      ) : null}

      {!loading && result?.ok && heroOffer ? (
        <div className="p-5">
          <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <div className="overflow-hidden rounded-ui border border-line bg-white">
              <img src={heroOffer.image} alt={heroOffer.title} className="aspect-[4/3] w-full object-cover" />
              <div className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${marketplaceClass(heroOffer.marketplace)}`}>
                    {heroOffer.marketplace}
                  </span>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-extrabold text-leaf ring-1 ring-green-100">
                    Giá tốt nhất
                  </span>
                </div>
                <h3 className="text-xl font-extrabold leading-snug">{heroOffer.title}</h3>
                <div className="mt-3 text-3xl font-extrabold text-shopee">{formatVnd(heroOffer.price)}</div>
                <div className="mt-1 text-sm text-muted line-through">{formatVnd(heroOffer.oldPrice)}</div>
                <a
                  href={heroOffer.affiliateUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  onClick={() => trackClick(heroOffer)}
                  className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-ui bg-ink px-4 py-3 text-sm font-extrabold text-white"
                >
                  Mở trên {heroOffer.marketplace}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div>
              <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-ui border border-line p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-muted"><ShoppingBag className="h-4 w-4" />Nguồn dữ liệu</div>
                  <div className="mt-2 font-extrabold">{result.mode === "shopee-api" ? "Shopee Public API" : result.mode === "playwright" ? "Playwright Crawler" : "Crawler"}</div>
                </div>
                <div className="rounded-ui border border-line p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-muted"><PackageCheck className="h-4 w-4" />Số kết quả</div>
                  <div className="mt-2 font-extrabold">{result.totalOffers || sortedOffers.length} sản phẩm</div>
                </div>
                <div className="rounded-ui border border-line p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-muted"><TrendingDown className="h-4 w-4" />Tiết kiệm</div>
                  <div className="mt-2 font-extrabold text-leaf">{formatVnd(result.saving)}</div>
                </div>
                <div className="rounded-ui border border-line p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-muted"><Clock className="h-4 w-4" />Cập nhật</div>
                  <div className="mt-2 font-extrabold">{formatTime(result.crawledAt)}</div>
                </div>
              </div>

              <div className="grid gap-3">
                {sortedOffers.map((offer, index) => (
                  <article key={offer.id} className="grid gap-3 rounded-ui border border-line p-3 transition hover:border-shopee md:grid-cols-[96px_1fr_auto] md:items-center">
                    <img src={offer.image} alt={offer.title} className="aspect-square w-full rounded-ui object-cover md:w-24" />
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${marketplaceClass(offer.marketplace)}`}>
                          {offer.marketplace}
                        </span>
                        {index === 0 ? <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-extrabold text-leaf">Rẻ nhất</span> : null}
                        <span className="text-xs font-bold text-muted">{offer.source === "shopee-api" ? "Shopee API" : "Playwright"}</span>
                      </div>
                      <h4 className="truncate text-base font-extrabold">{offer.title}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                        <span>{offer.shopName}</span>
                        <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-current text-amber-500" />{offer.rating}</span>
                        <span>Đã bán {offer.sold.toLocaleString("vi-VN")}</span>
                        <span>{offer.condition}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:block md:text-right">
                      <div>
                        <div className="text-lg font-extrabold text-shopee">{formatVnd(offer.price)}</div>
                        <div className="text-xs text-muted line-through">{formatVnd(offer.oldPrice)}</div>
                      </div>
                      <a
                        href={offer.affiliateUrl}
                        target="_blank"
                        rel="nofollow sponsored noopener"
                        onClick={() => trackClick(offer)}
                        className="focus-ring inline-flex items-center gap-2 rounded-ui bg-shopee px-3 py-2 text-sm font-extrabold text-white"
                      >
                        Xem giá
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {result.note ? <p className="mt-4 text-xs leading-5 text-muted">{result.note}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
