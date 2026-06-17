import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { formatVnd, getLowestOffer, type Product } from "@/lib/data";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const lowest = getLowestOffer(product);

  return (
    <article className="card overflow-hidden flex flex-col h-full">
      <img src={product.imageUrl} alt={product.name} className="aspect-[4/3] w-full object-cover" />
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ocean">{product.brand} · {product.storage}</div>
        <h3 className="text-lg font-extrabold leading-snug">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{product.shortDescription}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-muted">Giá rẻ nhất</div>
            <div className="text-xl font-extrabold text-shopee">{formatVnd(lowest.price)}</div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-sm font-bold text-yellow-700">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            {lowest.rating}
          </div>
        </div>
        <Link href={`/products/${product.slug}`} className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-ui bg-ink px-4 py-3 text-sm font-extrabold text-white">
          So sánh giá
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
