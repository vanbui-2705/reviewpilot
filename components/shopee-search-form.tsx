"use client";

import { useState, useCallback } from "react";
import {
  Search,
  Loader2,
  AlertCircle,
  Star,
  ShoppingCart,
  Package,
  ExternalLink,
  TrendingUp,
} from "lucide-react";

type ShopeeItem = {
  item_basic?: {
    itemid: number;
    shopid: number;
    name: string;
    image: string;
    price: number;
    price_max: number;
    price_before_discount?: number;
    stock: number;
    sold: number;
    liked_count: number;
    rating_star: number;
    item_rating?: {
      rating_count: number[];
    };
  };
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price / 100000); // Shopee API trả về đơn vị * 100000
}

function getImageUrl(hash: string): string {
  if (hash.startsWith("/")) return hash;
  if (hash.startsWith("http")) return hash;
  return `https://down-vn.img.susercontent.com/file/${hash}`;
}

export function ShopeeSearchForm() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ShopeeItem[]>([]);
  const [keyword, setKeyword] = useState("");

  const handleSearch = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!query.trim()) return;
      setLoading(true);
      setError(null);
      setItems([]);

      try {
        const res = await fetch("/api/tools/crawl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: query.trim() }),
        });
        const data = await res.json();
        if (!data.ok) {
          setError(data.error || "Không tìm thấy kết quả.");
        } else {
          setItems(data.results || []);
          setKeyword(data.keyword || query);
        }
      } catch {
        setError("Lỗi kết nối. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  return (
    <div className="rounded-2xl border border-line bg-white shadow-panel overflow-hidden">
      {/* Search form */}
      <div className="p-5 md:p-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Nhập từ khóa hoặc link Shopee</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
              placeholder="Nhập từ khóa hoặc dán link sản phẩm Shopee..."
              className="focus-ring w-full rounded-xl border border-line bg-soft py-4 pl-12 pr-4 text-sm font-medium placeholder:text-muted/70 transition-colors"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-shopee px-6 py-4 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-shopee/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
            {loading ? "Đang tìm..." : "Cào dữ liệu"}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {items.length > 0 && (
        <div className="border-t border-line">
          <div className="flex items-center justify-between px-5 py-3 bg-soft/60">
            <p className="text-sm font-bold text-muted">
              Tìm thấy{" "}
              <span className="font-extrabold text-ink">{items.length}</span>{" "}
              sản phẩm cho{" "}
              <span className="font-extrabold text-shopee">"{keyword}"</span>
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-leaf">
              <TrendingUp className="h-4 w-4" />
              Dữ liệu thực từ Shopee
            </div>
          </div>
          <div className="grid divide-y divide-line/50">
            {items.slice(0, 10).map((item, idx) => {
              const p = item.item_basic;
              if (!p) return null;
              const price = p.price / 100000;
              const priceMax = p.price_max / 100000;
              const originalPrice = p.price_before_discount
                ? p.price_before_discount / 100000
                : null;
              const discount =
                originalPrice && originalPrice > price
                  ? Math.round(((originalPrice - price) / originalPrice) * 100)
                  : null;
              const shopeeUrl = `https://shopee.vn/product/${p.shopid}/${p.itemid}`;
              const totalRating = p.item_rating?.rating_count?.reduce((a, b) => a + b, 0) || 0;

              return (
                <div
                  key={`${p.itemid}-${idx}`}
                  className="flex items-start gap-4 p-4 hover:bg-soft/40 transition-colors"
                >
                  {/* Image */}
                  <div className="shrink-0 relative">
                    <div className="h-20 w-20 overflow-hidden rounded-xl border border-line bg-soft">
                      {p.image ? (
                        <img
                          src={getImageUrl(p.image)}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-2xl font-extrabold text-line">
                          ?
                        </div>
                      )}
                    </div>
                    {discount && (
                      <span className="absolute -top-1 -right-1 rounded-md bg-shopee px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                        -{discount}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug text-ink line-clamp-2">
                      {p.name}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {/* Price */}
                      <div>
                        <span className="text-base font-extrabold text-shopee">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            maximumFractionDigits: 0,
                          }).format(price)}
                        </span>
                        {priceMax > price && (
                          <span className="ml-1 text-xs text-muted">
                            ~{" "}
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                              maximumFractionDigits: 0,
                            }).format(priceMax)}
                          </span>
                        )}
                        {originalPrice && originalPrice > price && (
                          <span className="ml-2 text-xs text-muted line-through">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                              maximumFractionDigits: 0,
                            }).format(originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {/* Rating */}
                      {p.rating_star > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-yellow-50 px-2 py-1 font-bold text-yellow-700">
                          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                          {p.rating_star.toFixed(1)}
                          {totalRating > 0 && (
                            <span className="font-normal text-yellow-600">
                              ({totalRating.toLocaleString("vi-VN")})
                            </span>
                          )}
                        </span>
                      )}
                      {/* Sold */}
                      {p.sold > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-soft px-2 py-1 font-bold text-ink">
                          <ShoppingCart className="h-3.5 w-3.5 text-muted" />
                          Đã bán {p.sold.toLocaleString("vi-VN")}
                        </span>
                      )}
                      {/* Stock */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-bold ${
                          p.stock === 0
                            ? "bg-red-50 text-red-700"
                            : p.stock < 10
                              ? "bg-orange-50 text-orange-700"
                              : "bg-green-50 text-green-700"
                        }`}
                      >
                        <Package className="h-3.5 w-3.5" />
                        {p.stock === 0
                          ? "Hết hàng"
                          : `Còn ${p.stock.toLocaleString("vi-VN")}`}
                      </span>
                    </div>
                  </div>

                  {/* Link */}
                  <a
                    href={shopeeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-shopee/30 bg-shopee/5 px-3 py-2 text-xs font-extrabold text-shopee transition-colors hover:bg-shopee hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Shopee
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
