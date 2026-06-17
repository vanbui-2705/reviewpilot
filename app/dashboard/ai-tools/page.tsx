"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Bot,
  Check,
  Clipboard,
  Copy,
  FileText,
  Loader2,
  MessageSquareText,
  Sparkles,
  Tags,
} from "lucide-react";
import type { SentimentResult } from "@/lib/ai/local-tools";

type ToolId = "reply" | "description" | "price" | "sentiment" | "title";

type ResultState =
  | { type: "empty" }
  | { type: "text"; title: string; body: string; model?: string; meta?: string }
  | { type: "titles"; title: string; titles: string[]; model?: string }
  | {
      type: "sentiment";
      title: string;
      model?: string;
      analysis: {
        summary: string;
        sentiment: "positive" | "neutral" | "negative";
        score: number;
        highlights?: Array<{ text: string; sentiment: string; reason?: string }>;
        suggestions?: string[];
      };
    };

const tools = [
  {
    id: "reply" as const,
    label: "Trả lời review",
    desc: "Viết phản hồi lịch sự cho đánh giá xấu hoặc trung tính.",
    icon: MessageSquareText,
  },
  {
    id: "description" as const,
    label: "Mô tả sản phẩm",
    desc: "Tạo mô tả Shopee có lợi ích, bullet và CTA.",
    icon: FileText,
  },
  {
    id: "price" as const,
    label: "Phân tích giá",
    desc: "So giá với đối thủ và gợi ý mức bán hợp lý.",
    icon: BarChart3,
  },
  {
    id: "sentiment" as const,
    label: "Sentiment review",
    desc: "Tóm tắt cảm xúc và điểm nóng từ nhiều review.",
    icon: Bot,
  },
  {
    id: "title" as const,
    label: "Tên SEO",
    desc: "Sinh tiêu đề sản phẩm tối ưu tìm kiếm.",
    icon: Tags,
  },
];

const samples = {
  reply: {
    review: "Giao hàng hơi chậm, hộp bị móp nhẹ, sản phẩm dùng tạm ổn nhưng shop phản hồi tin nhắn lâu.",
    rating: "3",
    shopName: "ReviewPilot Shop",
  },
  description: {
    name: "Tai nghe bluetooth chống ồn",
    category: "Phụ kiện điện thoại",
    features: "Bluetooth 5.3\nPin 32 giờ\nChống ồn chủ động\nSạc nhanh Type-C\nBảo hành 6 tháng",
  },
  price: {
    productName: "iPhone 13 128GB cũ đẹp",
    productUrl: "https://shopee.vn/iphone-13-128gb-cu-dep-i.123456.987654",
    myPrice: "8650000",
    competitors: "Shop A, 8390000, 420, 4.8\nShop B, 8790000, 210, 4.7\nShop C, 8990000, 95, 4.9",
  },
  sentiment: {
    productName: "Ốp lưng iPhone 15",
    reviews:
      "Sản phẩm đẹp, cầm chắc tay, giao nhanh.\nMàu ngoài đời hơi khác ảnh, shop nên chụp rõ hơn.\nỐp hơi cứng, nút bấm khó dùng.\nĐóng gói kỹ, sẽ mua lại.\nGiá ổn nhưng giao hàng chậm.",
  },
  title: {
    name: "Máy xay sinh tố mini",
    keywords: "sạc usb, mang đi làm, xay hoa quả, nhỏ gọn",
  },
};

export default function AiToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolId>("reply");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState>({ type: "empty" });

  const active = useMemo(() => tools.find((tool) => tool.id === activeTool)!, [activeTool]);

  return (
    <main className="mx-auto max-w-[1240px]">
      <section className="mb-6 flex flex-col gap-4 border-b border-line/60 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-shopee">
            <Sparkles className="h-3.5 w-3.5" />
            AI workspace
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">Công cụ AI cho shop</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Viết phản hồi review, mô tả sản phẩm, phân tích giá, đọc sentiment và tạo tên SEO. Nếu Ollama chưa chạy,
            hệ thống tự dùng fallback local để bạn vẫn thao tác được.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-line bg-white p-2 text-center shadow-sm">
          <Metric label="Tool" value="5" />
          <Metric label="Fallback" value="On" />
          <Metric label="Mode" value="Shop" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_420px]">
        <aside className="space-y-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const active = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  setActiveTool(tool.id);
                  setError(null);
                }}
                className={`w-full rounded-lg border p-4 text-left transition-all ${
                  active
                    ? "border-shopee bg-orange-50 shadow-sm"
                    : "border-line bg-white hover:border-shopee/40 hover:bg-soft"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${active ? "bg-shopee text-white" : "bg-soft text-muted"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-ink">{tool.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted">{tool.desc}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </aside>

        <section className="rounded-lg border border-line bg-white shadow-sm">
          <div className="border-b border-line p-5">
            <p className="text-xs font-extrabold uppercase tracking-wide text-muted">Đầu vào</p>
            <h2 className="mt-1 text-xl font-extrabold text-ink">{active.label}</h2>
          </div>
          <div className="p-5">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}
            {activeTool === "reply" && <ReplyTool loading={loading} setLoading={setLoading} setError={setError} setResult={setResult} />}
            {activeTool === "description" && <DescriptionTool loading={loading} setLoading={setLoading} setError={setError} setResult={setResult} />}
            {activeTool === "price" && <PriceTool loading={loading} setLoading={setLoading} setError={setError} setResult={setResult} />}
            {activeTool === "sentiment" && <SentimentTool loading={loading} setLoading={setLoading} setError={setError} setResult={setResult} />}
            {activeTool === "title" && <TitleTool loading={loading} setLoading={setLoading} setError={setError} setResult={setResult} />}
          </div>
        </section>

        <ResultPanel result={result} loading={loading} />
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

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, className = "", ...inputProps } = props;
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink/80">{label}</span>
      <input
        {...inputProps}
        className={`w-full rounded-lg border border-line bg-white px-3.5 py-3 text-sm font-medium text-ink outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15 ${className}`}
      />
    </label>
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const { label, className = "", ...inputProps } = props;
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink/80">{label}</span>
      <textarea
        {...inputProps}
        className={`min-h-[120px] w-full resize-y rounded-lg border border-line bg-white px-3.5 py-3 text-sm font-medium leading-6 text-ink outline-none transition focus:border-shopee focus:ring-2 focus:ring-shopee/15 ${className}`}
      />
    </label>
  );
}

function Actions({ loading, onSample }: { loading: boolean; onSample: () => void }) {
  return (
    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
      <button
        type="submit"
        disabled={loading}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-shopee px-4 py-3 text-sm font-extrabold text-white transition hover:bg-shopee/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Đang xử lý" : "Tạo kết quả"}
      </button>
      <button
        type="button"
        onClick={onSample}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm font-extrabold text-ink transition hover:border-ink"
      >
        <Clipboard className="h-4 w-4" />
        Dùng mẫu
      </button>
    </div>
  );
}

async function postAI<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const contentType = res.headers.get("content-type") || "";
  const raw = await res.text();

  if (!contentType.includes("application/json")) {
    if (raw.includes("<!DOCTYPE") || raw.includes("<html")) {
      throw new Error(res.status === 401 ? "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại." : "API trả về HTML thay vì JSON. Hãy reload lại server/dev cache.");
    }
    throw new Error(raw || `API không trả JSON (HTTP ${res.status}).`);
  }

  const data = JSON.parse(raw);
  if (!res.ok || !data.ok) throw new Error(data.error || "Không xử lý được yêu cầu.");
  return data as T;
}
type ToolProps = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResult: (result: ResultState) => void;
};

function ReplyTool({ loading, setLoading, setError, setResult }: ToolProps) {
  const [review, setReview] = useState("");
  const [rating, setRating] = useState("3");
  const [shopName, setShopName] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await postAI<{ suggestion: string; model?: string }>("/api/ai/reply", { review, rating, shopName });
      setResult({ type: "text", title: "Phản hồi gợi ý", body: data.suggestion, model: data.model });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <TextArea label="Review khách hàng" value={review} onChange={(e) => setReview(e.target.value)} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Số sao" type="number" min="1" max="5" value={rating} onChange={(e) => setRating(e.target.value)} />
        <Field label="Tên shop" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="VD: ReviewPilot Shop" />
      </div>
      <Actions loading={loading} onSample={() => { setReview(samples.reply.review); setRating(samples.reply.rating); setShopName(samples.reply.shopName); }} />
    </form>
  );
}

function DescriptionTool({ loading, setLoading, setError, setResult }: ToolProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [features, setFeatures] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await postAI<{ description: string; model?: string }>("/api/ai/product-desc", { name, category, features });
      setResult({ type: "text", title: "Mô tả sản phẩm", body: data.description, model: data.model });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Tên sản phẩm" value={name} onChange={(e) => setName(e.target.value)} required />
      <Field label="Danh mục" value={category} onChange={(e) => setCategory(e.target.value)} />
      <TextArea label="Tính năng nổi bật" value={features} onChange={(e) => setFeatures(e.target.value)} />
      <Actions loading={loading} onSample={() => { setName(samples.description.name); setCategory(samples.description.category); setFeatures(samples.description.features); }} />
    </form>
  );
}

function PriceTool({ loading, setLoading, setError, setResult }: ToolProps) {
  const [productUrl, setProductUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [myPrice, setMyPrice] = useState("");
  const [competitors, setCompetitors] = useState("");

  function parseCompetitors() {
    return competitors
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [shopName, price, sold, rating] = line.split(",").map((item) => item.trim());
        return {
          shopName: shopName || "Đối thủ",
          price: Number(price),
          sold: Number(sold) || undefined,
          rating: Number(rating) || undefined,
        };
      })
      .filter((item) => item.price > 0);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await postAI<{
        analysis: string;
        model?: string;
        competitorCount: number;
        product?: { name: string; price: number };
      }>("/api/ai/price-insight", {
        productUrl,
        productName,
        myPrice: myPrice ? Number(myPrice) : undefined,
        competitorPrices: parseCompetitors(),
      });
      const meta = data.product?.price
        ? `${data.competitorCount} đối thủ - ${data.product.price.toLocaleString("vi-VN")}đ`
        : `${data.competitorCount} đối thủ`;
      setResult({ type: "text", title: "Phân tích giá", body: data.analysis, model: data.model, meta });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <TextArea
        label="Link sản phẩm hoặc từ khóa cần phân tích"
        value={productUrl}
        onChange={(e) => setProductUrl(e.target.value)}
        placeholder="Dán link Shopee sản phẩm của bạn, hoặc nhập keyword như: iPhone 13 128GB cũ"
        className="min-h-[86px]"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tên sản phẩm tùy chọn" value={productName} onChange={(e) => setProductName(e.target.value)} />
        <Field label="Giá của bạn VND tùy chọn" type="number" value={myPrice} onChange={(e) => setMyPrice(e.target.value)} />
      </div>
      <TextArea
        label="Đối thủ thủ công, mỗi dòng: Shop, Giá, Đã bán, Rating"
        value={competitors}
        onChange={(e) => setCompetitors(e.target.value)}
        placeholder="Bỏ trống nếu muốn hệ thống tự tìm sản phẩm tương tự"
      />
      <Actions
        loading={loading}
        onSample={() => {
          setProductUrl(samples.price.productUrl);
          setProductName(samples.price.productName);
          setMyPrice(samples.price.myPrice);
          setCompetitors("");
        }}
      />
    </form>
  );
}
function SentimentTool({ loading, setLoading, setError, setResult }: ToolProps) {
  const [productName, setProductName] = useState("");
  const [reviews, setReviews] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await postAI<{ analysis: SentimentResult; model?: string }>("/api/ai/sentiment", {
        productName,
        reviews: reviews.split("\n").map((item) => item.trim()).filter((item) => item.length > 4),
      });
      setResult({ type: "sentiment", title: "Phân tích sentiment", analysis: data.analysis, model: data.model });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Tên sản phẩm" value={productName} onChange={(e) => setProductName(e.target.value)} />
      <TextArea label="Reviews, mỗi dòng một review" value={reviews} onChange={(e) => setReviews(e.target.value)} required className="min-h-[190px]" />
      <Actions loading={loading} onSample={() => { setProductName(samples.sentiment.productName); setReviews(samples.sentiment.reviews); }} />
    </form>
  );
}

function TitleTool({ loading, setLoading, setError, setResult }: ToolProps) {
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await postAI<{ titles: string[]; model?: string }>("/api/ai/title", { name, keywords });
      setResult({ type: "titles", title: "Tên sản phẩm SEO", titles: data.titles, model: data.model });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Tên sản phẩm gốc" value={name} onChange={(e) => setName(e.target.value)} required />
      <Field label="Từ khóa phụ" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
      <Actions loading={loading} onSample={() => { setName(samples.title.name); setKeywords(samples.title.keywords); }} />
    </form>
  );
}

function ResultPanel({ result, loading }: { result: ResultState; loading: boolean }) {
  const textToCopy =
    result.type === "text"
      ? result.body
      : result.type === "titles"
        ? result.titles.join("\n")
        : result.type === "sentiment"
          ? `${result.analysis.summary}\nScore: ${result.analysis.score}/100`
          : "";

  return (
    <aside className="rounded-lg border border-line bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-line p-5">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-muted">Kết quả</p>
          <h2 className="mt-1 text-xl font-extrabold text-ink">{result.type === "empty" ? "Chưa có nội dung" : result.title}</h2>
        </div>
        {textToCopy && <CopyButton text={textToCopy} />}
      </div>

      <div className="min-h-[420px] p-5">
        {loading && (
          <div className="grid min-h-[360px] place-items-center text-center text-muted">
            <div>
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-shopee" />
              <p className="mt-3 text-sm font-bold">Đang xử lý yêu cầu...</p>
            </div>
          </div>
        )}

        {!loading && result.type === "empty" && (
          <div className="grid min-h-[360px] place-items-center rounded-lg border border-dashed border-line bg-soft p-8 text-center">
            <div>
              <Bot className="mx-auto h-9 w-9 text-muted/60" />
              <p className="mt-3 text-sm font-bold text-muted">Chọn tool, nhập dữ liệu hoặc bấm dùng mẫu để bắt đầu.</p>
            </div>
          </div>
        )}

        {!loading && result.type === "text" && (
          <div className="space-y-4">
            <ResultMeta model={result.model} meta={result.meta} />
            <pre className="whitespace-pre-wrap rounded-lg bg-soft p-4 text-sm leading-7 text-ink">{result.body}</pre>
          </div>
        )}

        {!loading && result.type === "titles" && (
          <div className="space-y-4">
            <ResultMeta model={result.model} />
            <div className="space-y-3">
              {result.titles.map((title, index) => (
                <div key={title} className="flex items-start gap-3 rounded-lg border border-line bg-soft p-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white text-sm font-extrabold text-shopee">{index + 1}</span>
                  <p className="min-w-0 flex-1 text-sm font-bold leading-6 text-ink">{title}</p>
                  <CopyButton text={title} compact />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && result.type === "sentiment" && (
          <div className="space-y-4">
            <ResultMeta model={result.model} meta={`${result.analysis.score}/100`} />
            <div className="rounded-lg border border-line bg-soft p-4">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${sentimentClass(result.analysis.sentiment)}`}>
                {result.analysis.sentiment}
              </span>
              <p className="mt-3 text-sm font-bold leading-6 text-ink">{result.analysis.summary}</p>
            </div>
            {result.analysis.highlights?.map((item, index) => (
              <div key={`${item.text}-${index}`} className="rounded-lg border border-line p-3">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold ${sentimentClass(item.sentiment)}`}>
                  {item.sentiment}
                </span>
                <p className="mt-2 text-sm leading-6 text-ink">{item.text}</p>
                {item.reason && <p className="mt-1 text-xs font-medium text-muted">{item.reason}</p>}
              </div>
            ))}
            {result.analysis.suggestions?.length ? (
              <div className="rounded-lg bg-orange-50 p-4">
                <p className="text-xs font-extrabold uppercase text-shopee">Gợi ý hành động</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
                  {result.analysis.suggestions.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
}

function ResultMeta({ model, meta }: { model?: string; meta?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {model && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">Model: {model}</span>}
      {meta && <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-extrabold text-green-700">{meta}</span>}
    </div>
  );
}

function sentimentClass(sentiment: string) {
  if (sentiment === "positive") return "bg-green-100 text-green-700";
  if (sentiment === "negative") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

function CopyButton({ text, compact = false }: { text: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white text-sm font-extrabold text-ink transition hover:border-ink ${
        compact ? "h-8 w-8 p-0" : "px-3 py-2"
      }`}
      title="Copy"
    >
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      {!compact && <span>{copied ? "Đã copy" : "Copy"}</span>}
    </button>
  );
}
