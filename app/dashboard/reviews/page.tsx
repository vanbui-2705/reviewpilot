"use client";

import { useEffect, useState } from "react";
import { Bot, MessageSquareReply, AlertTriangle, RefreshCw } from "lucide-react";

type ReviewItem = {
  id: string;
  reviewerName: string;
  rating: number;
  content: string;
  status: string;
  productName: string;
  createdAt: string | null;
  needsAction: boolean;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      if (data.ok) setReviews(data.reviews || []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const pending = reviews.filter((r) => r.needsAction);

  return (
    <main className="bg-soft py-8">
      <div className="container-page">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-extrabold uppercase tracking-wide text-shopee">Review Monitor</p>
            <h1 className="mt-2 text-3xl font-extrabold">Đánh giá cần xử lý</h1>
            <p className="mt-1 text-sm text-muted">{pending.length} đánh giá tiêu cực đang chờ phản hồi</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-ui border border-line bg-white px-4 py-3 font-extrabold hover:bg-soft transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="card p-12 text-center text-muted">
            <AlertTriangle className="mx-auto h-10 w-10 text-muted/60" />
            <p className="mt-3 text-sm font-bold">Chưa có đánh giá nào.</p>
            <p className="mt-1 text-xs">Crawl review từ Shopee để bắt đầu theo dõi.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reviews.map((alert) => (
              <article key={alert.id} className="card p-5 transition-shadow hover:shadow-panel">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-shopee" />
                      <b>{alert.reviewerName}</b>
                      <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-extrabold text-red-700">{alert.rating} sao</span>
                      <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-extrabold text-shopee">
                        {alert.rating <= 2 ? "Tiêu cực" : "Trung lập"}
                      </span>
                      <span className="rounded-full bg-soft px-2 py-1 text-xs font-bold text-muted">{alert.productName}</span>
                    </div>
                    <p className="mt-3 text-muted italic">"{alert.content}"</p>
                    {alert.createdAt && (
                      <p className="mt-2 text-xs text-muted/70">
                        {new Date(alert.createdAt).toLocaleString("vi-VN")}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button className="inline-flex items-center gap-2 rounded-ui bg-shopee px-3 py-2 text-sm font-extrabold text-white hover:bg-shopee/90 transition-colors">
                      <Bot className="h-4 w-4" />
                      AI reply
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-ui border border-line px-3 py-2 text-sm font-extrabold hover:bg-soft transition-colors">
                      <MessageSquareReply className="h-4 w-4" />
                      Template
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
