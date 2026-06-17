import { formatVnd, type Product } from "@/lib/data";

export function PriceChart({ product }: { product: Product }) {
  const max = Math.max(...product.priceHistory.map((item) => item.price));
  const min = Math.min(...product.priceHistory.map((item) => item.price));

  return (
    <div className="card p-5">
      <h2 className="text-xl font-extrabold">Biến động giá 30 ngày</h2>
      <div className="mt-5 flex h-56 items-end gap-3 border-b border-line">
        {product.priceHistory.map((item) => {
          const height = 36 + ((item.price - min) / Math.max(1, max - min)) * 150;
          return (
            <div key={item.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="text-xs font-bold text-muted">{formatVnd(item.price).replace("₫", "")}</div>
              <div className="w-full rounded-t bg-ocean" style={{ height }} />
              <div className="text-xs text-muted">{item.date}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
