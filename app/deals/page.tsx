"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgePercent, ExternalLink, Flame } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

type DealProduct = {
  id: string;
  name: string;
  image: string;
  price: number;
  priceMax?: number;
  sold: number;
  rating: number;
  commission: string;
  category: string;
  score: string;
  affiliateUrl: string;
};

export default function DealsPage() {
  const [products, setProducts] = useState<DealProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/deals")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setProducts(data.products);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmt = (v: number) =>
    new Intl.NumberFormat("vi-VN").format(v) + "đ";

  return (
    <main className="bg-soft py-14">
      <div className="container-page">
        <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-extrabold uppercase tracking-wide text-shopee">Deals</p>
            <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">Deal và sản phẩm đang đẩy affiliate</h1>
            <p className="mt-3 max-w-2xl text-muted">
              Trang public để gom traffic mua sắm, gắn link affiliate và dẫn người dùng sang sản phẩm liên quan.
            </p>
          </div>
          <Link href="/search" className="btn-outline">
            Tìm sản phẩm khác <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-line" />
                <div className="p-4">
                  <div className="h-4 w-3/4 rounded bg-line" />
                  <div className="mt-2 h-5 w-1/2 rounded bg-line" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted">Chưa có deal nào. Hãy crawl sản phẩm Shopee để xem deal!</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="card overflow-hidden">
                <div className="relative">
                  <img src={product.image} alt={product.name} className="aspect-[4/3] w-full object-cover" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-shopee px-3 py-1 text-xs font-extrabold text-white">
                    <Flame className="h-3.5 w-3.5" />
                    Hot
                  </span>
                </div>
                <div className="p-4">
                  <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-extrabold text-shopee">
                    <BadgePercent className="h-3.5 w-3.5" />
                    {product.commission}
                  </div>
                  <h2 className="text-base font-extrabold leading-snug">{product.name}</h2>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-extrabold text-shopee">{fmt(product.price)}</span>
                    <span className="text-muted">{product.score} sao</span>
                  </div>
                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-extrabold text-white"
                  >
                    Mở deal <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
