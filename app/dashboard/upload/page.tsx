"use client";

import { useState } from "react";
import { Sparkles, Loader2, Upload, Check, Copy, ChevronDown } from "lucide-react";

export default function UploadProductPage() {
  const [step, setStep] = useState<"form" | "review">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", price: "", stock: "100", category: "", features: "" });
  const [result, setResult] = useState<{ id: string; name: string; price: number; description: string; seoTitles: string[]; model: string } | null>(null);

  async function generateProduct(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setResult(data.product);
      setStep("review");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function uploadToShopee() {
    if (!result) return;
    setUploading(true);
    setError(null);
    setUploadResult(null);
    try {
      const res = await fetch("/api/products/upload/shopee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: result.id, name: result.name, price: result.price, description: result.description }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setUploadResult(data.url || "Đang xử lý upload...");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <main className="mx-auto max-w-[900px] space-y-6">
      <section className="border-b border-line/60 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-shopee">
          <Upload className="h-3.5 w-3.5" />
          Đăng sản phẩm
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">Tạo & Đăng sản phẩm lên Shopee</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">Nhập thông tin sản phẩm, AI tự động tạo mô tả và tên SEO. Sau đó upload lên Shopee.</p>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
      )}

      {uploadResult && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700 flex items-center gap-2">
          <Check className="h-4 w-4" /> {uploadResult}
        </div>
      )}

      {step === "form" && (
        <form onSubmit={generateProduct} className="rounded-lg border border-line bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-extrabold text-ink">Thông tin sản phẩm</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-bold text-ink/80">Tên sản phẩm *</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3.5 py-3 text-sm font-medium text-ink outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15" placeholder="VD: Tai nghe bluetooth chống ồn" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-ink/80">Giá bán (VND) *</span>
              <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3.5 py-3 text-sm font-medium text-ink outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15" placeholder="299000" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-ink/80">Tồn kho</span>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3.5 py-3 text-sm font-medium text-ink outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-bold text-ink/80">Danh mục</span>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3.5 py-3 text-sm font-medium text-ink outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15" placeholder="VD: Phụ kiện điện thoại" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-bold text-ink/80">Tính năng (mỗi dòng 1 tính năng)</span>
              <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3.5 py-3 text-sm font-medium text-ink outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15 min-h-[100px]"
                placeholder="Bluetooth 5.3&#10;Pin 32 giờ&#10;Chống ồn chủ động" />
            </label>
          </div>
          <button type="submit" disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-shopee px-4 py-3 text-sm font-extrabold text-white transition hover:bg-shopee/90 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Đang AI viết mô tả..." : "Tạo sản phẩm"}
          </button>
        </form>
      )}

      {step === "review" && result && (
        <div className="space-y-5">
          <div className="rounded-lg border border-line bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-extrabold text-ink">Xem trước sản phẩm</h2>
            <div>
              <p className="text-xs font-extrabold uppercase text-muted mb-1">Tên sản phẩm</p>
              <p className="text-base font-bold text-ink">{result.name}</p>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase text-muted mb-1">Giá bán</p>
              <p className="text-xl font-extrabold text-shopee">{result.price.toLocaleString("vi-VN")}đ</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-extrabold uppercase text-muted">Mô tả Shopee</p>
                <button type="button" onClick={() => copy(result.description)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-shopee hover:underline">
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded-lg bg-soft p-4 text-sm leading-7 text-ink">{result.description}</pre>
              {result.model !== "local-fallback" && (
                <p className="mt-1 text-[11px] font-bold text-muted">Model: {result.model}</p>
              )}
            </div>
            {result.seoTitles.length > 0 && (
              <div>
                <p className="text-xs font-extrabold uppercase text-muted mb-2">Tên SEO gợi ý</p>
                <div className="space-y-2">
                  {result.seoTitles.slice(0, 3).map((title, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg border border-line bg-soft p-3">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white text-xs font-extrabold text-shopee">{i + 1}</span>
                      <p className="flex-1 text-sm font-bold leading-6 text-ink">{title}</p>
                      <button type="button" onClick={() => copy(title)} className="text-muted hover:text-ink">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep("form")}
                className="flex-1 rounded-lg border border-line bg-white px-4 py-3 text-sm font-extrabold text-ink hover:border-ink">
                Quay lại sửa
              </button>
              <button type="button" onClick={uploadToShopee} disabled={uploading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#ee4d2d] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#d8481e] disabled:cursor-not-allowed disabled:opacity-60">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Đang upload..." : "Đăng lên Shopee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
