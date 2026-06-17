"use client";

import { useEffect, useState } from "react";
import { TrendingDown, RefreshCw, AlertTriangle } from "lucide-react";

type CompetitorItem = {
  id: string;
  name: string;
  shopName: string;
  image: string;
  price: number;
  previousPrice: number;
  rating: number;
  sold: number;
  url: string;
  source: string;
};

export default function CompetitorsPage() {
  const [keyword, setKeyword] = useState("iphone 13");
  const [items, setItems] = useState<CompetitorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  async function search() {
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/competitors/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: keyword, myPrice: 0 }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Không crawl được dữ liệu.");
      setItems(data.items || []);
      setSource(data.source);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const sorted = [...items].sort((a, b) => a.price - b.price);
  const avgPrice = items.length ? Math.round(items.reduce((s, i) => s + i.price, 0) / items.length) : 0;
  const drops = items.filter((i) => i.price < i.previousPrice);

  return (
    <main className="bg-soft py-8">
      <div className="container-page">
        <div className="mb-6">
          <p className="font-extrabold uppercase tracking-wide text-shopee">Đối thủ cạnh tranh</p>
          <h1 className="mt-2 text-3xl font-extrabold">Theo dõi đối thủ</h1>
          <p className="mt-1 text-sm text-muted">Crawl giá thật từ Shopee API — dữ liệu thực tế, không giả lập.</p>
        </div>

        <div className="card mb-6 p-4">
          <form onSubmit={(e) => { e.preventDefault(); search(); }} className="flex gap-3">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Từ khóa hoặc link sản phẩm Shopee..."
              className="flex-1 rounded-ui border border-line bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-ui bg-shopee px-6 py-3 font-extrabold text-white hover:bg-shopee/90 disabled:opacity-60 transition-colors"
            >
              {loading ? "Đang crawl..." : "Crawl đối thủ"}
            </button>
          </form>
          {source && (
            <p className="mt-2 text-xs font-bold text-muted">
              Nguồn dữ liệu: <span className="text-leaf">{source === "shopee-api" ? "Shopee Public API" : "Playwright Browser"}</span>
              · {items.length} kết quả
            </p>
          )}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

        {items.length > 0 && (
          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <div className="card p-4 text-center">
              <div className="text-xs font-bold text-muted uppercase">Giá trung bình</div>
              <div className="mt-1 text-2xl font-extrabold text-ink">{avgPrice.toLocaleString("vi-VN")}đ</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-xs font-bold text-muted uppercase">Giá rẻ nhất</div>
              <div className="mt-1 text-2xl font-extrabold text-leaf">{sorted[0]?.price.toLocaleString("vi-VN")}đ</div>
              <div className="text-xs text-muted">{sorted[0]?.shopName}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-xs font-bold text-muted uppercase">Đang giảm giá</div>
              <div className="mt-1 text-2xl font-extrabold text-shopee">{drops.length}</div>
              <div className="text-xs text-muted">trên {items.length} sản phẩm</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => <div key={n} className="card p-5 h-40 animate-pulse bg-soft" />)}
          </div>
        ) : items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((item) => {
              const change = item.previousPrice > 0
                ? Math.round(((item.previousPrice - item.price) / item.previousPrice) * 100)
                : 0;
              return (
                <article key={item.id} className="card overflow-hidden transition-shadow hover:shadow-panel">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="aspect-[16/9] w-full object-cover" />
                  )}
                  <div className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-extrabold leading-snug line-clamp-2">{item.name}</h3>
                      {change > 0 && (
                        <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-xs font-extrabold text-red-700">
                          -{change}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mb-3">{item.shopName}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-lg font-extrabold text-shopee">{item.price.toLocaleString("vi-VN")}đ</div>
                        {change > 0 && (
                          <div className="text-xs text-muted line-through">{item.previousPrice.toLocaleString("vi-VN")}đ</div>
                        )}
                      </div>
                      <div className="text-xs text-muted text-right">
                        ⭐ {item.rating} · Bán {item.sold?.toLocaleString()}
                      </div>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block text-center rounded-lg border border-line py-2 text-xs font-extrabold hover:bg-soft transition-colors"
                    >
                      Xem trên Shopee
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : !error && !loading ? (
          <div className="card p-12 text-center text-muted">
            <TrendingDown className="mx-auto h-10 w-10 text-muted/60" />
            <p className="mt-3 text-sm font-bold">Nhập từ khóa để crawl đối thủ thật.</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
