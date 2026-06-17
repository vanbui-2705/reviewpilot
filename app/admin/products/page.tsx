import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { formatVnd, getLowestOffer } from "@/lib/data";
import { getProducts } from "@/lib/product-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-extrabold uppercase tracking-wide text-shopee">Products</p>
          <h1 className="mt-2 text-3xl font-extrabold">Quản lý sản phẩm crawl</h1>
          <p className="mt-1 text-sm text-muted">Kiểm tra ảnh, giá thấp nhất, link affiliate và trạng thái crawl.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline"><RefreshCw className="h-4 w-4" />Chạy crawl</button>
          <button className="btn-primary"><Plus className="h-4 w-4" />Thêm sản phẩm</button>
        </div>
      </div>

      <div className="grid gap-4">
        {products.map((product) => {
          const lowest = getLowestOffer(product);
          return (
            <article key={product.id} className="card grid gap-4 p-4 md:grid-cols-[120px_1fr_auto] md:items-center">
              <img src={product.image} alt={product.name} className="aspect-square w-full rounded-lg object-cover md:w-28" />
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap gap-2">
                  <span className="badge-shopee">{product.brand}</span>
                  <span className="badge">{product.storage}</span>
                  <span className="badge">{product.condition}</span>
                </div>
                <h2 className="text-lg font-extrabold">{product.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{product.shortDescription}</p>
                <div className="mt-3 text-sm text-muted">Nguồn: {product.offers.length} sàn - Crawl lần cuối: 31/05</div>
              </div>
              <div className="flex items-center justify-between gap-4 md:block md:text-right">
                <div>
                  <div className="text-xs font-bold text-muted">Giá thấp nhất</div>
                  <div className="text-xl font-extrabold text-shopee">{formatVnd(lowest.price)}</div>
                  <div className="text-xs text-muted">{lowest.marketplace} - {lowest.shopName}</div>
                </div>
                <Link href={`/products/${product.slug}`} className="mt-3 inline-flex rounded-lg bg-ink px-3 py-2 text-sm font-extrabold text-white md:mt-4">
                  Xem page
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
