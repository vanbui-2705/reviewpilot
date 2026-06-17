"use client";

import { useEffect, useState } from "react";
import { LeadForm } from "@/components/lead-form";

type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlight?: boolean;
};

const pricingPlans: Plan[] = [
  { name: "Free", price: "0đ", description: "Dùng thử công cụ public và giới hạn dashboard.", features: ["Downloader video", "So sánh giá", "5 sản phẩm theo dõi", "Bản tin Shopee"] },
  { name: "Starter", price: "299.000đ", description: "Dashboard đầy đủ cho shop mới bắt đầu.", features: ["Tất cả tính năng Free", "50 sản phẩm", "Theo dõi 3 đối thủ", "AI cơ bản"], highlight: true },
  { name: "Pro", price: "799.000đ", description: "Cho shop chuyên nghiệp với quota lớn.", features: ["500 sản phẩm", "10 đối thủ", "AI nâng cao", "Hỗ trợ ưu tiên"] },
];

export default function PricingPage() {
  return (
    <main>
      <section className="page-band py-16">
        <div className="container-page">
          <p className="font-extrabold uppercase tracking-wide text-shopee">Pricing</p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">Gói phù hợp từng giai đoạn shop</h1>
        </div>
      </section>
      <section className="py-16">
        <div className="container-page grid gap-5 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div key={plan.name} className={`card p-6 ${plan.highlight ? "border-shopee shadow-panel" : ""}`}>
              <div className="text-xl font-extrabold">{plan.name}</div>
              <div className="mt-3 text-4xl font-extrabold">{plan.price}<span className="text-base text-muted">/tháng</span></div>
              <p className="text-muted">{plan.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-muted">
                {plan.features.map((feature) => <li key={feature}>• {feature}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-ink py-16 text-white">
        <div className="container-page grid gap-8 md:grid-cols-[1fr_420px] md:items-center">
          <div>
            <h2 className="text-3xl font-extrabold">Đăng ký dùng thử</h2>
            <p className="mt-3 text-white/70">Form này gọi API `/api/leads`, sau đó có thể nối CRM hoặc thanh toán VietQR/MoMo.</p>
          </div>
          <LeadForm />
        </div>
      </section>
    </main>
  );
}
