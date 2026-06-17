"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  Upload,
  Check,
  Copy,
  ChevronRight,
  Image as ImageIcon,
  Tag,
  Package,
  FileText,
  ListChecks,
  Settings2,
  X,
  ChevronLeft,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

interface GeneratedContent {
  description: string;
  seoTitles: string[];
  model: string;
  tokensUsed?: number;
}

export default function UploadProductPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [savedProductId, setSavedProductId] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    condition: "new",
    features: "",
    description: "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function handleGenerateAI() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/product-desc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          features: form.features,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Lỗi generate AI");

      const titlesRes = await fetch("/api/ai/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, keywords: form.category }),
      });
      const titlesData = await titlesRes.json();

      setGenerated({
        description: data.description,
        seoTitles: titlesData.titles || [],
        model: data.model,
        tokensUsed: data.tokensUsed,
      });
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveAndUpload() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          stock: form.stock ? Number(form.stock) : 100,
          category: form.category,
          features: form.features,
          description: generated?.description || form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Lỗi lưu sản phẩm");
      setSavedProductId(data.product.id);
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadToShopee() {
    setUploading(true);
    setError(null);
    try {
      const res = await fetch("/api/products/upload-to-shopee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: savedProductId, name: form.name }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Upload thất bại");
      setUploadResult(data.message || "Đã đăng sản phẩm lên Shopee");
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function resetForm() {
    setStep(1);
    setGenerated(null);
    setSavedProductId(null);
    setUploadResult(null);
    setError(null);
    setForm({ name: "", price: "", stock: "", category: "", brand: "", condition: "new", features: "", description: "" });
  }

  const steps = [
    { n: 1, label: "Thông tin", icon: Package },
    { n: 2, label: "Nội dung AI", icon: Sparkles },
    { n: 3, label: "Xác nhận", icon: Check },
    { n: 4, label: "Đăng Shopee", icon: Upload },
  ];

  return (
    <main className="mx-auto max-w-[960px]">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => (step > 1 ? setStep((step - 1) as Step) : null)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink transition"
        >
          <ArrowLeft className="h-4 w-4" />
          {step > 1 ? "Quay lại" : "Đăng sản phẩm mới"}
        </button>
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-shopee">
          <Upload className="h-3.5 w-3.5" />
          Đăng sản phẩm
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">
          Thêm sản phẩm lên Shopee
        </h1>
        <p className="mt-2 text-sm text-muted max-w-xl">
          Điền thông tin sản phẩm, AI tự động viết mô tả + tên SEO. Sau đó đăng thẳng lên shop của bạn.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted/40" />}
            <div className="flex items-center gap-2">
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-xs font-extrabold ${
                  step >= s.n ? "bg-shopee text-white" : "bg-line text-muted"
                }`}
              >
                {s.n}
              </span>
              <span className={`text-xs font-bold ${step >= s.n ? "text-ink" : "text-muted/60"}`}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 flex items-start gap-2">
          <X className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* STEP 1 — Thông tin cơ bản */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="rounded-xl border border-line bg-white shadow-sm overflow-hidden">
            <div className="border-b border-line px-6 py-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-shopee" />
              <h2 className="text-sm font-extrabold text-ink uppercase tracking-wide">Thông tin cơ bản</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-ink/80">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="VD: Tai nghe bluetooth chống ồn ANC Pro Max"
                  className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-ink/80">
                    Giá bán (VND) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => update("price", e.target.value)}
                      placeholder="299000"
                      className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15"
                      required
                    />
                    <span className="absolute right-3 top-3 text-xs text-muted font-bold">đ</span>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-ink/80">Tồn kho</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => update("stock", e.target.value)}
                    placeholder="100"
                    className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-ink/80">Danh mục</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    placeholder="VD: Phụ kiện điện thoại"
                    className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-ink/80">Thương hiệu</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => update("brand", e.target.value)}
                    placeholder="VD: Anker, Baseus..."
                    className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-ink/80">Tình trạng</label>
                <div className="flex gap-3">
                  {["new", "used", "refurbished"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => update("condition", c)}
                      className={`rounded-lg border px-4 py-2.5 text-sm font-bold transition ${
                        form.condition === c
                          ? "border-shopee bg-orange-50 text-shopee"
                          : "border-line bg-white text-muted hover:border-ink/30"
                      }`}
                    >
                      {c === "new" ? "Mới" : c === "used" ? "Đã sử dụng" : "Tân trang"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-white shadow-sm overflow-hidden">
            <div className="border-b border-line px-6 py-4 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-shopee" />
              <h2 className="text-sm font-extrabold text-ink uppercase tracking-wide">Tính năng nổi bật</h2>
            </div>
            <div className="p-6">
              <label className="mb-1.5 block text-sm font-bold text-ink/80">
                Mỗi dòng một tính năng (AI sẽ dùng để viết mô tả)
              </label>
              <textarea
                value={form.features}
                onChange={(e) => update("features", e.target.value)}
                placeholder={"Bluetooth 5.3\nPin 32 giờ\nChống ồn chủ động ANC\nSạc nhanh Type-C\nBảo hành 6 tháng"}
                rows={6}
                className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium leading-6 text-ink outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15 resize-y"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!form.name || !form.price) {
                setError("Vui lòng nhập tên sản phẩm và giá bán.");
                return;
              }
              setError(null);
              handleGenerateAI();
            }}
            disabled={generating}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-shopee px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-shopee/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                AI đang viết mô tả + tên SEO...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Tạo mô tả bằng AI và tiếp tục
              </>
            )}
          </button>
        </div>
      )}

      {/* STEP 2 — Xem lại nội dung AI */}
      {step === 2 && generated && (
        <div className="space-y-5">
          <div className="rounded-xl border border-line bg-white shadow-sm overflow-hidden">
            <div className="border-b border-line px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-shopee" />
                <h2 className="text-sm font-extrabold text-ink uppercase tracking-wide">Mô tả sản phẩm (AI)</h2>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-muted hover:text-shopee transition"
              >
                Sửa lại
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase text-muted">Tên sản phẩm</span>
                <p className="mt-1 text-lg font-extrabold text-ink">{form.name}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <span className="text-xs font-bold uppercase text-muted">Giá</span>
                  <p className="mt-1 text-xl font-extrabold text-shopee">
                    {Number(form.price).toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-muted">Tồn kho</span>
                  <p className="mt-1 text-lg font-extrabold text-ink">{form.stock || 100}</p>
                </div>
                {form.category && (
                  <div>
                    <span className="text-xs font-bold uppercase text-muted">Danh mục</span>
                    <p className="mt-1 text-sm font-bold text-ink">{form.category}</p>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-muted">Mô tả sản phẩm</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generated.description);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-muted hover:text-shopee transition"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                </div>
                <div className="mt-2 rounded-lg border border-line bg-soft p-5">
                  <pre className="whitespace-pre-wrap text-sm leading-7 text-ink font-medium">
                    {generated.description}
                  </pre>
                </div>
                <p className="mt-1.5 text-[11px] text-muted">
                  Generated by {generated.model} · {generated.tokensUsed ? `${generated.tokensUsed} tokens` : ""}
                </p>
              </div>
              {generated.seoTitles.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase text-muted">Gợi ý tên SEO</span>
                  <div className="mt-2 space-y-2">
                    {generated.seoTitles.slice(0, 5).map((title, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-line bg-soft p-3"
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white text-xs font-extrabold text-shopee">
                          {i + 1}
                        </span>
                        <p className="text-sm font-bold leading-5 text-ink flex-1">{title}</p>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(title)}
                          className="p-1.5 text-muted hover:text-shopee transition"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm font-extrabold text-ink transition hover:bg-soft"
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </button>
            <button
              type="button"
              onClick={handleSaveAndUpload}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-shopee px-4 py-3 text-sm font-extrabold text-white transition hover:bg-shopee/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {loading ? "Đang lưu..." : "Lưu & Tiếp tục"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — Xác nhận & đăng lên Shopee */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="rounded-xl border border-green-200 bg-green-50 p-5 flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-extrabold text-green-800">Sản phẩm đã lưu vào hệ thống</p>
              <p className="mt-1 text-xs text-green-700">
                {form.name} · {Number(form.price).toLocaleString("vi-VN")}đ · Tồn: {form.stock || 100}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-white shadow-sm overflow-hidden">
            <div className="border-b border-line px-6 py-4 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-shopee" />
              <h2 className="text-sm font-extrabold text-ink uppercase tracking-wide">Cấu hình Shopee Seller</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted">
                Để đăng sản phẩm tự động, cần kết nối với Shopee Seller Center của bạn.
              </p>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-bold text-blue-800 mb-2">Hướng dẫn kết nối:</p>
                <ol className="list-decimal pl-5 text-xs text-blue-700 space-y-1">
                  <li>Mở file <code className="bg-blue-100 px-1.5 py-0.5 rounded font-bold">.env</code> ở thư mục gốc</li>
                  <li>Thêm: <code className="bg-blue-100 px-1.5 py-0.5 rounded font-bold">SHOPEE_SELLER_EMAIL=email_cua_ban</code></li>
                  <li>Thêm: <code className="bg-blue-100 px-1.5 py-0.5 rounded font-bold">SHOPEE_SELLER_PASSWORD=mat_khau</code></li>
                  <li>Lưu file và bấm "Đăng lên Shopee" bên dưới</li>
                </ol>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-bold text-amber-800 mb-1">Lưu ý bảo mật:</p>
                <p className="text-xs text-amber-700">
                  Mật khẩu được lưu trong <code className="bg-amber-100 px-1.5 py-0.5 rounded font-bold">.env</code> (không đưa lên git).
                  Không chia sẻ file này với ai.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm font-extrabold text-ink transition hover:bg-soft"
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </button>
            <button
              type="button"
              onClick={handleUploadToShopee}
              disabled={uploading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-shopee px-4 py-3 text-sm font-extrabold text-white transition hover:bg-shopee/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang đăng...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Đăng lên Shopee
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 — Hoàn tất */}
      {step === 4 && (
        <div className="space-y-5">
          <div className="rounded-xl border border-green-200 bg-white shadow-sm p-8">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-ink">Đăng sản phẩm thành công!</h2>
              <p className="mt-2 text-sm text-muted max-w-md">
                <span className="font-bold text-ink">{form.name}</span> đã được tạo và đăng lên Shopee.
                {uploadResult && <span className="block mt-1 text-xs text-muted">{uploadResult}</span>}
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-md">
                <div className="rounded-lg border border-line bg-soft p-3 text-center">
                  <p className="text-[11px] font-bold uppercase text-muted">Giá</p>
                  <p className="mt-1 text-sm font-extrabold text-ink">{Number(form.price).toLocaleString("vi-VN")}đ</p>
                </div>
                <div className="rounded-lg border border-line bg-soft p-3 text-center">
                  <p className="text-[11px] font-bold uppercase text-muted">Tồn</p>
                  <p className="mt-1 text-sm font-extrabold text-ink">{form.stock || 100}</p>
                </div>
                <div className="rounded-lg border border-line bg-soft p-3 text-center">
                  <p className="text-[11px] font-bold uppercase text-muted">Model</p>
                  <p className="mt-1 text-sm font-extrabold text-ink">{generated?.model || "local"}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3 w-full max-w-md">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-shopee px-4 py-3 text-sm font-extrabold text-white transition hover:bg-shopee/90"
                >
                  <RefreshCw className="h-4 w-4" />
                  Đăng sản phẩm khác
                </button>
                <a
                  href="https://seller.shopee.vn/product"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm font-extrabold text-ink transition hover:bg-soft"
                >
                  Mở Seller Center
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
