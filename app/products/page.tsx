"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { formatVnd, getLowestOffer, type Product } from "@/lib/data";

// ── Types ─────────────────────────────────────────────────────────

type SortOption = "newest" | "price_asc" | "price_desc";

// ── Component ──────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [brands, setBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const LIMIT = 20;

  // ── Fetch products ───────────────────────────────────────────────
  const fetchProducts = useCallback(
    async (pageNum: number, append = false) => {
      const isFirst = pageNum === 1;
      if (isFirst) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          limit: String(LIMIT),
          sort,
        });
        if (search) params.set("search", search);
        if (brand) params.set("brand", brand);

        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();

        if (data.ok) {
          setProducts((prev) => (append ? [...prev, ...data.products] : data.products));
          setTotal(data.total);
          setPage(pageNum);
        }
      } catch (err) {
        console.error("fetch products error:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, brand, sort]
  );

  // Load brands on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/products?limit=1");
        const data = await res.json();
        if (data.ok && data.brands) setBrands(data.brands);
      } catch {}
    })();
  }, []);

  // Fetch on filter/sort change
  useEffect(() => {
    fetchProducts(1, false);
  }, [search, brand, sort, fetchProducts]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (sentinelRef.current) {
      observerRef.current?.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            products.length < total &&
            !loadingMore
          ) {
            fetchProducts(page + 1, true);
          }
        },
        { rootMargin: "200px" }
      );
      observerRef.current.observe(sentinelRef.current);
    }
    return () => observerRef.current?.disconnect();
  }, [products.length, total, loadingMore, page, fetchProducts]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const clearBrand = () => {
    setBrand("");
    setPage(1);
  };

  const clearAll = () => {
    setSearch("");
    setBrand("");
    setSort("newest");
    setPage(1);
  };

  // ── Render helpers ───────────────────────────────────────────────
  const hasFilters = search || brand;

  return (
    <main className="min-h-screen bg-soft">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line bg-white">
        {/* Decorative bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-ocean/5 via-white to-shopee/5" />
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-shopee/5 blur-3xl" />
        <div className="absolute -left-32 -bottom-32 h-64 w-64 rounded-full bg-ocean/5 blur-3xl" />

        <div className="relative container-page py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="font-extrabold uppercase tracking-widest text-ocean">
              Product Registry
            </p>
            <h1 className="mt-3 text-4xl font-extrabold md:text-6xl leading-tight">
              So sánh giá<br />
              <span className="text-shopee">điện thoại</span> thông minh
            </h1>
            <p className="mt-5 text-lg text-muted max-w-lg">
              Dữ liệu giá real-time từ Shopee, Lazada, Tiki. Tìm deal tốt nhất
              với AI-powered price tracking.
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-10 max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm iPhone, Samsung, Xiaomi..."
                className="w-full rounded-xl border-2 border-line bg-white py-4 pl-12 pr-4 text-base font-medium shadow-sm outline-none transition-colors placeholder:text-muted/70 focus:border-shopee focus:ring-4 focus:ring-shopee/10"
              />
              {search && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-4 rounded-full p-1 text-muted hover:bg-soft"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick brand pills */}
          {brands.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {brands.slice(0, 8).map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    setBrand(b === brand ? "" : b);
                    setPage(1);
                  }}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
                    brand === b
                      ? "bg-ink text-white shadow-lg shadow-ink/20"
                      : "bg-soft text-ink hover:bg-ink/10"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <section className="sticky top-0 z-30 border-b border-line bg-white/80 backdrop-blur-md">
        <div className="container-page">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-bold md:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Bộ lọc
              </button>

              {/* Results count */}
              <span className="text-sm text-muted">
                <span className="font-extrabold text-ink">{total}</span> sản phẩm
              </span>

              {/* Active brand pill */}
              {brand && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean/10 px-3 py-1 text-sm font-bold text-ocean">
                  {brand}
                  <button onClick={clearBrand} className="rounded-full p-0.5 hover:bg-ocean/20">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as SortOption);
                    setPage(1);
                  }}
                  className="appearance-none rounded-lg border border-line bg-white px-3 py-2 pr-8 text-sm font-bold outline-none focus:border-shopee"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá thấp → cao</option>
                  <option value="price_desc">Giá cao → thấp</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted pointer-events-none" />
              </div>

              {/* Clear all filters */}
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="text-sm font-bold text-muted hover:text-shopee"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>

          {/* Expandable filter panel */}
          {showFilters && (
            <div className="border-t border-line py-4">
              <p className="text-sm font-bold text-muted mb-2">Chọn hãng</p>
              <div className="flex flex-wrap gap-2">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setBrand(b === brand ? "" : b);
                      setPage(1);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                      brand === b
                        ? "bg-ink text-white"
                        : "bg-soft text-ink hover:bg-ink/10"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Product Grid ─────────────────────────────────────────── */}
      <section className="container-page py-8">
        {loading ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <EmptyState search={search} brand={brand} onClear={() => { setSearch(""); setBrand(""); setSort("newest"); setPage(1); }} />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="mt-10 flex justify-center">
              {loadingMore && <LoadingSpinner />}
              {products.length >= total && products.length > 0 && (
                <p className="text-sm text-muted py-4">
                  Đã hiển thị tất cả {total} sản phẩm
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

// ── Product Card ───────────────────────────────────────────────────

function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const lowest = getLowestOffer(product);

  return (
    <article
      className="group card flex flex-col overflow-hidden transition-all hover:shadow-xl hover:shadow-ink/10 hover:-translate-y-1"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
        <div className="relative aspect-[4/3] overflow-hidden bg-soft">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="inline-block rounded-full bg-ocean/10 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide text-ocean">
              {product.brand}
            </span>
            <span className="text-xs text-muted">{product.storage}</span>
          </div>

          <h3 className="text-base font-extrabold leading-snug line-clamp-2">
            {product.name}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted">
            {product.shortDescription}
          </p>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-muted">Giá rẻ nhất</div>
              <div className="text-xl font-extrabold text-shopee">
                {formatVnd(lowest.price)}
              </div>
            </div>
            <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-bold text-yellow-700">
              {lowest.marketplace}
            </span>
          </div>

          <div className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-extrabold text-white transition-colors group-hover:bg-shopee">
            So sánh giá
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </article>
  );
}

// ── Loading & Empty States ─────────────────────────────────────────

function ProductGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="card overflow-hidden"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="aspect-[4/3] animate-pulse bg-line" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-1/3 animate-pulse rounded bg-line" />
            <div className="h-5 w-full animate-pulse rounded bg-line" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-line" />
            <div className="h-8 w-1/2 animate-pulse rounded bg-line mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-shopee border-t-transparent" />
      <span className="text-sm font-bold text-muted">Đang tải thêm...</span>
    </div>
  );
}

function EmptyState({
  search,
  brand,
  onClear,
}: {
  search: string;
  brand: string;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-soft p-5">
        <Search className="h-10 w-10 text-muted" />
      </div>
      <h2 className="mt-5 text-xl font-extrabold">
        {search || brand ? "Không tìm thấy sản phẩm" : "Chưa có sản phẩm"}
      </h2>
      <p className="mt-2 max-w-md text-muted">
        {search || brand
          ? `Thử tìm kiếm khác hoặc xóa bộ lọc để xem tất cả sản phẩm.`
          : "Hãy crawl dữ liệu từ Shopee để hiển thị sản phẩm."}
      </p>
      {(search || brand) && (
        <button
          onClick={onClear}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-shopee px-5 py-3 font-extrabold text-white"
        >
          Xem tất cả sản phẩm
        </button>
      )}
    </div>
  );
}
