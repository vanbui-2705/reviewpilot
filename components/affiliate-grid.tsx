"use client";

import { ExternalLink } from "lucide-react";

type ProductItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  commission: string;
  category: string;
  score: string;
  affiliateUrl: string;
};

type Props = {
  products?: ProductItem[];
};

export function AffiliateGrid({ products = [] }: Props) {
  async function trackClick(productId: string, url: string) {
    await fetch("/api/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, url }),
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <article key={product.id} className="card overflow-hidden flex flex-col h-full">
          <img src={product.image} alt={product.name} className="aspect-[4/3] w-full object-cover" />
          <div className="flex flex-1 flex-col p-4">
            <div className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ocean">{product.category}</div>
            <h3 className="text-base font-extrabold leading-snug">{product.name}</h3>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="font-extrabold text-shopee">
                {new Intl.NumberFormat("vi-VN").format(product.price)}đ
              </span>
              <span className="text-muted">{product.score} sao</span>
            </div>
            <div className="mt-2 text-sm text-muted">Hoa hồng dự kiến: {product.commission}</div>
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="nofollow sponsored noopener"
              onClick={() => trackClick(product.id, product.affiliateUrl)}
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-ui bg-shopee px-4 py-3 text-sm font-extrabold text-white"
            >
              Mua trên Shopee <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
