"use client";

import { useEffect, useState } from "react";
import { PackagePlus, RefreshCw } from "lucide-react";

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  sold: number;
  rating: number;
  url: string;
  lastSynced: string | null;
  status: string;
  alert: string;
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Không tải được dữ liệu.");
      setItems(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStock(sku: string, delta: number) {
    setUpdating(sku);
    try {
      const item = items.find((i) => i.sku === sku);
      if (!item) return;
      const newStock = Math.max(0, item.stock + delta);
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, name: item.name, stock: newStock }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setItems((prev) => prev.map((i) => (i.sku === sku ? { ...i, stock: newStock } : i)));
    } catch {
      // silent fail
    } finally {
      setUpdating(null);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="bg-soft py-8">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-extrabold uppercase tracking-wide text-shopee">Kho hàng</p>
            <h1 className="mt-2 text-3xl font-extrabold">Quản lý tồn kho</h1>
            <p className="mt-1 text-sm text-muted">
              {items.length} sản phẩm · cập nhật realtime từ Shopee
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-ui border border-line bg-white px-4 py-3 font-extrabold hover:bg-soft transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
            <button className="rounded-ui bg-ink px-4 py-3 font-extrabold text-white hover:bg-ink/90 transition-colors">
              Import CSV
            </button>
          </div>
        </div>

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="card p-5 h-32 animate-pulse bg-soft" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 card p-12 text-center text-muted">
            <PackagePlus className="mx-auto h-10 w-10 text-muted/60" />
            <p className="mt-3 text-sm font-bold">Chưa có sản phẩm trong kho.</p>
            <p className="mt-1 text-xs">Kết nối shop và chạy crawl để đồng bộ sản phẩm.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="card p-5 transition-shadow hover:shadow-panel">
                <div className="flex items-start gap-3">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-soft grid place-items-center text-xl font-extrabold text-line shrink-0">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-extrabold text-muted truncate">{item.sku}</div>
                    <h2 className="mt-1 font-extrabold leading-snug line-clamp-2">{item.name}</h2>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Tồn kho</span>
                    <b className={item.stock < 5 ? "text-red-600" : ""}>{item.stock}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Đã bán</span>
                    <b>{item.sold.toLocaleString()}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Giá</span>
                    <b className="text-shopee">{item.price.toLocaleString("vi-VN")}đ</b>
                  </div>
                </div>
                <div className={`mt-4 rounded-full px-3 py-2 text-center text-sm font-extrabold ${
                  item.alert === "Ổn" ? "bg-green-50 text-leaf" :
                  item.alert === "Sắp hết" ? "bg-yellow-50 text-yellow-700" :
                  "bg-red-50 text-red-700"
                }`}>
                  {item.alert}
                </div>
                {item.stock < 5 && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => updateStock(item.sku, 50)}
                      disabled={updating === item.sku}
                      className="flex-1 rounded-ui border border-line bg-white py-2 text-sm font-bold hover:bg-soft transition-colors disabled:opacity-50"
                    >
                      {updating === item.sku ? "Đang cập nhật..." : "+ Nhập thêm 50"}
                    </button>
                  </div>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block text-center text-xs font-extrabold text-shopee hover:underline"
                  >
                    Xem trên Shopee →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
