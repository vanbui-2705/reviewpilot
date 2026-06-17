"use client";

import { useState } from "react";
import {
  Bot,
  CheckCircle2,
  ImagePlus,
  Info,
  Loader2,
  PackagePlus,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";

type Draft = {
  source: string;
  sourceType: string;
  name: string;
  title: string;
  description: string;
  category: string;
  image: string;
  sourcePrice: number;
  price: number;
  stock: number;
  sku: string;
  weight: number;
  condition: string;
  attributes: Array<{ name: string; value: string }>;
  comparedOffers: Array<{ shopName: string; price: number; rating: number; sold: number }>;
};

function formatVnd(value: number) {
  return `${Math.round(value || 0).toLocaleString("vi-VN")}đ`;
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  const data = JSON.parse(raw);
  if (!res.ok || !data.ok) throw new Error(data.error || "Không xử lý được yêu cầu.");
  return data as T;
}

export default function ListingPage() {
  const [source, setSource] = useState("iphone 13 128gb cũ đẹp");
  const [category, setCategory] = useState("Điện thoại & phụ kiện");
  const [targetMargin, setTargetMargin] = useState("18");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<any>(null);

  async function createDraft(event: React.FormEvent) {
    event.preventDefault();
    setLoadingDraft(true);
    setError(null);
    setPublishResult(null);
    try {
      const data = await postJSON<{ draft: Draft }>("/api/listing/draft", {
        source,
        category,
        targetMargin: Number(targetMargin),
      });
      setDraft(data.draft);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingDraft(false);
    }
  }

  async function publish() {
    if (!draft) return;
    setPublishing(true);
    setError(null);
    try {
      const data = await postJSON("/api/listing/publish", draft);
      setPublishResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  }

  function updateDraft<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  }

  return (
    <main className="mx-auto max-w-[1240px]">
      <section className="mb-6 flex flex-col gap-4 border-b border-line/60 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-shopee">
            <PackagePlus className="h-3.5 w-3.5" />
            Listing automation
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">Tự động tạo listing Shopee</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Dán link sản phẩm nguồn hoặc nhập từ khóa, hệ thống tạo bản nháp đăng sản phẩm với tiêu đề, mô tả, giá, tồn kho và preview.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-line bg-white p-2 text-center shadow-sm">
          <Metric label="Mode" value="Shopee API" />
          <Metric label="AI" value="On" />
          <Metric label="API" value="Ready" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
        <form onSubmit={createDraft} className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-shopee" />
            <h2 className="text-lg font-extrabold text-ink">Nguồn sản phẩm</h2>
          </div>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-bold text-ink/80">Link Shopee hoặc từ khóa</span>
            <textarea
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className="min-h-[110px] w-full resize-y rounded-lg border border-line px-3.5 py-3 text-sm font-medium outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15"
              placeholder="VD: link sản phẩm Shopee hoặc iphone 13 128gb cũ đẹp"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-bold text-ink/80">Danh mục</span>
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-lg border border-line px-3.5 py-3 text-sm font-medium outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-bold text-ink/80">Biên lợi nhuận mục tiêu (%)</span>
            <input
              type="number"
              value={targetMargin}
              onChange={(event) => setTargetMargin(event.target.value)}
              className="w-full rounded-lg border border-line px-3.5 py-3 text-sm font-medium outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15"
            />
          </label>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loadingDraft}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-shopee px-4 py-3 text-sm font-extrabold text-white transition hover:bg-shopee/90 disabled:opacity-60"
          >
            {loadingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loadingDraft ? "Đang tạo bản nháp" : "Tạo listing"}
          </button>

          <div className="mt-5 rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-800">
            <div className="flex items-center gap-2 font-extrabold">
              <Info className="h-4 w-4" />
              Lưu ý
            </div>
            <p className="mt-1">Nút đăng hiện là Shopee API. Dữ liệu thật từ Shopee cần cấu hình Shopee Open Platform: app key, secret, shop id và token.</p>
          </div>
        </form>

        <section className="rounded-lg border border-line bg-white shadow-sm">
          <div className="border-b border-line p-5">
            <p className="text-xs font-extrabold uppercase tracking-wide text-muted">Bản nháp listing</p>
            <h2 className="mt-1 text-xl font-extrabold text-ink">{draft ? draft.name : "Chưa tạo listing"}</h2>
          </div>

          {!draft ? (
            <div className="grid min-h-[520px] place-items-center p-8 text-center text-muted">
              <div>
                <ImagePlus className="mx-auto h-10 w-10 text-muted/60" />
                <p className="mt-3 text-sm font-bold">Nhập nguồn sản phẩm và bấm Tạo listing để tạo bản nháp.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-5">
              <img src={draft.image || "/assets/product-shop.svg"} alt={draft.name} className="aspect-[16/9] w-full rounded-lg border border-line object-cover" />

              <Field label="Tiêu đề Shopee" value={draft.title} onChange={(value) => updateDraft("title", value)} />
              <TextArea label="Mô tả sản phẩm" value={draft.description} onChange={(value) => updateDraft("description", value)} />

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Giá bán" type="number" value={String(draft.price)} onChange={(value) => updateDraft("price", Number(value))} />
                <Field label="Tồn kho" type="number" value={String(draft.stock)} onChange={(value) => updateDraft("stock", Number(value))} />
                <Field label="SKU" value={draft.sku} onChange={(value) => updateDraft("sku", value)} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Khối lượng gram" type="number" value={String(draft.weight)} onChange={(value) => updateDraft("weight", Number(value))} />
                <Field label="Tình trạng" value={draft.condition} onChange={(value) => updateDraft("condition", value)} />
              </div>

              <button
                type="button"
                onClick={publish}
                disabled={publishing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-extrabold text-white transition hover:bg-ink/90 disabled:opacity-60"
              >
                {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {publishing ? "Đang gửi" : "Đăng lên Shopee"}
              </button>

              {publishResult && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  <div className="flex items-center gap-2 font-extrabold">
                    <CheckCircle2 className="h-4 w-4" />
                    {publishResult.message}
                  </div>
                  <p className="mt-1">Listing ID: {publishResult.listingId}</p>
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-shopee" />
              <h2 className="text-lg font-extrabold text-ink">Preview</h2>
            </div>
            {draft ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-line">
                <img src={draft.image || "/assets/product-shop.svg"} alt={draft.title} className="aspect-square w-full object-cover" />
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-extrabold leading-5 text-ink">{draft.title}</h3>
                  <div className="mt-2 text-xl font-extrabold text-shopee">{formatVnd(draft.price)}</div>
                  <div className="mt-2 flex items-center justify-between text-xs font-bold text-muted">
                    <span>Kho: {draft.stock}</span>
                    <span>{draft.condition}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">Preview sẽ hiển thị sau khi tạo listing.</p>
            )}
          </div>

          {draft && (
            <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <h2 className="text-lg font-extrabold text-ink">Giá tham chiếu</h2>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Giá nguồn</span>
                  <b>{formatVnd(draft.sourcePrice)}</b>
                </div>
                {draft.comparedOffers.map((offer) => (
                  <div key={`${offer.shopName}-${offer.price}`} className="rounded-lg bg-soft p-3 text-sm">
                    <div className="font-extrabold text-ink">{offer.shopName}</div>
                    <div className="mt-1 flex justify-between text-xs text-muted">
                      <span>{formatVnd(offer.price)}</span>
                      <span>Bán {offer.sold} - {offer.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[74px] rounded-md bg-soft px-3 py-2">
      <div className="text-[11px] font-bold uppercase text-muted">{label}</div>
      <div className="text-lg font-extrabold text-ink">{value}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink/80">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-line px-3.5 py-3 text-sm font-medium outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink/80">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[180px] w-full resize-y rounded-lg border border-line px-3.5 py-3 text-sm font-medium leading-6 outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15"
      />
    </label>
  );
}
