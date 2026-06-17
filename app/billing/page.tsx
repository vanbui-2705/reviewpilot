"use client";

import { useState } from "react";
import { CheckCircle2, Copy, ExternalLink, QrCode, ShieldCheck } from "lucide-react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "200.000",
    priceNum: 200_000,
    desc: "Cho shop moi bat dau",
    features: ["500 crawl/thang", "1 shop", "Review alerts", "Dashboard co ban"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "400.000",
    priceNum: 400_000,
    desc: "Cho shop dang phat trien",
    features: ["2000 crawl/thang", "3 shops", "AI sentiment", "Competitor tracker", "Priority support"],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "1.000.000",
    priceNum: 1_000_000,
    desc: "Cho shop lon, multi-brand",
    features: ["Unlimited crawl", "Unlimited shops", "Tat ca AI tools", "API access", "Dedicated support"],
  },
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [method, setMethod] = useState<"momo" | "vietqr">("vietqr");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    method: string;
    payUrl?: string;
    qrImageUrl?: string;
    bankInfo?: string;
    accountNumber?: string;
    accountName?: string;
    transferContent?: string;
    orderId?: string;
    amount?: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Loi");
      setResult(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Loi thanh toan");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="py-16">
      <div className="container-page">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold">Nang cap goi dich vu</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Chon goi phu hop, thanh toan nhanh chong qua MoMo hoặc VietQR.
            Quyen truy cap duoc mo ngay sau khi thanh toan thanh cong.
          </p>
        </div>

        {!result ? (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`card cursor-pointer p-6 transition-all ${
                    selectedPlan === plan.id
                      ? "ring-2 ring-shopee"
                      : plan.popular
                ? "ring-2 ring-ink/20"
                : ""
                  }`}
                >
                  {plan.popular && (
                    <span className="mb-3 inline-block rounded-full bg-ink px-3 py-1 text-xs font-extrabold text-white">
                      PHo BIEN NHAT
                    </span>
                  )}
                  <h2 className="text-xl font-extrabold">{plan.name}</h2>
                  <p className="mt-1 text-sm text-muted">{plan.desc}</p>
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold">{plan.price}</span>
                    <span className="text-sm text-muted">đ/tháng</span>
                  </div>
                  <ul className="mt-5 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-10 max-w-md">
              <p className="mb-3 text-center text-sm font-extrabold text-muted">
                Phuong thuc thanh toan
              </p>
              <div className="flex gap-3">
                {(["vietqr", "momo"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`flex-1 rounded-ui border py-3 text-sm font-extrabold transition-colors ${
                      method === m
                        ? "border-shopee bg-shopee/5 text-shopee"
                        : "border-line hover:border-ink/30"
                    }`}
                  >
                    {m === "vietqr" ? "VietQR" : "MoMo"}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCheckout}
                disabled={!selectedPlan || loading}
                className="btn-primary mt-6 w-full py-3.5 disabled:opacity-50"
              >
                {loading ? "Dang xu ly..." : `Thanh toan ${selectedPlan ? PLANS.find((p) => p.id === selectedPlan)?.price : "0"}d`}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
                <ShieldCheck className="h-3.5 w-3.5" />
                Bao mat boi SSL — khong luu thong tin the
              </div>
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-lg">
            <div className="card p-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
              <h2 className="mt-4 text-2xl font-extrabold">Yeu cau thanh toan</h2>
              <p className="mt-2 text-sm text-muted">
                So tien: <span className="font-extrabold text-ink">{result.amount?.toLocaleString("vi-VN")}d</span>
              </p>

              {result.method === "vietqr" && result.qrImageUrl && (
                <div className="mt-6">
                  <img
                    src={result.qrImageUrl}
                    alt="VietQR"
                    className="mx-auto rounded-lg border border-line"
                    width={250}
                  />
                  <div className="mt-4 rounded-ui border border-line bg-soft p-4 text-left text-sm">
                    <p className="font-extrabold text-muted">Ngan hang:</p>
                    <p className="mt-1 font-bold">{result.bankInfo}</p>
                    <p className="mt-2 font-extrabold text-muted">So tai khoan:</p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="font-bold">{result.accountNumber}</p>
                      <button
                        onClick={() => copyToClipboard(result.accountNumber!)}
                        className="text-shopee hover:underline"
                      >
                        {copied ? "Da copy!" : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="mt-2 font-extrabold text-muted">Ten chu tai khoan:</p>
                    <p className="font-bold">{result.accountName}</p>
                    <p className="mt-2 font-extrabold text-muted">Noi dung chuyen khoan:</p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="font-bold">{result.transferContent}</p>
                      <button
                        onClick={() => copyToClipboard(result.transferContent!)}
                        className="text-shopee hover:underline"
                      >
                        {copied ? "Da copy!" : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-muted">
                    Chuyen khoan dung noi dung de he thong tu dong nhan dien.
                    Quyen truy cap duoc mo sau 1-5 phut.
                  </p>
                </div>
              )}

              {result.method === "momo" && result.payUrl && (
                <div className="mt-6">
                  <a
                    href={result.payUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <QrCode className="h-4 w-4" />
                    Mo Mo — Tien hanh thanh toan
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  {result.qrCodeUrl && (
                    <div className="mt-4">
                      <img
                        src={result.qrCodeUrl}
                        alt="MoMo QR"
                        className="mx-auto rounded-lg border border-line"
                        width={200}
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setResult(null)}
                className="mt-6 text-sm font-bold text-muted hover:text-ink"
              >
                ← Chon goi khac
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
