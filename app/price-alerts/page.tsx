"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

type AlertItem = {
  product: string;
  target: string;
  current: string;
  subscribers: number;
};

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/price-alerts")
      .then((r) => r.json())
      .then((data) => { if (data.ok) setAlerts(data.alerts); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="py-16">
      <div className="container-page grid gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="font-extrabold uppercase tracking-wide text-shopee">Price alerts</p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">Theo dõi giá giảm</h1>
          <p className="mt-5 text-lg text-muted">Public lead magnet: người mua để lại email/Zalo, hệ thống gửi thông báo khi giá giảm dưới ngưỡng.</p>
          <div className="mt-8 grid gap-3">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-4 w-1/3 rounded bg-line" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-line" />
                </div>
              ))
            ) : alerts.length === 0 ? (
              <p className="text-muted">Chưa có sản phẩm nào. Crawl shop để xem giá!</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.product} className="card flex flex-col justify-between gap-3 p-4 md:flex-row md:items-center">
                  <div>
                    <b>{alert.product}</b>
                    <p className="m-0 text-sm text-muted">Mục tiêu {alert.target} · hiện tại {alert.current}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-extrabold text-shopee"><BellRing className="h-4 w-4" />{alert.subscribers} người theo dõi</span>
                </div>
              ))
            )}
          </div>
        </div>
        <form className="card h-fit p-5">
          <h2 className="text-xl font-extrabold">Tạo cảnh báo giá</h2>
          <div className="mt-4 grid gap-3">
            <input className="focus-ring rounded-ui border-line" placeholder="Sản phẩm muốn theo dõi" />
            <input className="focus-ring rounded-ui border-line" placeholder="Giá mục tiêu, ví dụ 7.000.000đ" />
            <input className="focus-ring rounded-ui border-line" placeholder="Email hoặc Zalo" />
            <button type="button" className="rounded-ui bg-shopee px-5 py-3 font-extrabold text-white">Lưu cảnh báo</button>
          </div>
        </form>
      </div>
    </main>
  );
}
