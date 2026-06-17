"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, RefreshCw } from "lucide-react";

type OrderItem = {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: string;
  createdAt: string | null;
  orders?: number;
  revenue?: number;
};

const statusColor: Record<string, string> = {
  completed: "bg-green-50 text-leaf",
  pending: "bg-yellow-50 text-yellow-700",
  needs_reply: "bg-orange-50 text-orange-700",
  resolved: "bg-blue-50 text-ocean",
};

const statusLabel: Record<string, string> = {
  completed: "Hoàn thành",
  pending: "Chờ xử lý",
  needs_reply: "Cần xử lý",
  resolved: "Đã xử lý",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.ok) setOrders(data.orders || []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totalAmount = orders.reduce((s, o) => s + o.amount, 0);

  return (
    <main className="bg-soft py-8">
      <div className="container-page">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-extrabold uppercase tracking-wide text-shopee">Đơn hàng</p>
            <h1 className="mt-2 text-3xl font-extrabold">Quản lý đơn hàng</h1>
            <p className="mt-1 text-sm text-muted">
              {orders.length} đơn · Tổng {totalAmount.toLocaleString("vi-VN")}đ
            </p>
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

        <div className="card overflow-hidden p-0">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-muted">
              <ShieldCheck className="mx-auto h-10 w-10 text-muted/60" />
              <p className="mt-3 text-sm font-bold">Chưa có đơn hàng nào.</p>
              <p className="mt-1 text-xs">Kết nối shop để bắt đầu đồng bộ đơn hàng.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-line bg-soft/50 text-left text-muted">
                    <th className="px-5 py-3 font-bold">Mã đơn</th>
                    <th className="px-5 py-3 font-bold">Khách hàng</th>
                    <th className="px-5 py-3 font-bold">Sản phẩm</th>
                    <th className="px-5 py-3 font-bold text-right">Số tiền</th>
                    <th className="px-5 py-3 font-bold text-center">Trạng thái</th>
                    <th className="px-5 py-3 font-bold">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-line hover:bg-soft/30 transition-colors">
                      <td className="px-5 py-4 font-extrabold">{order.id}</td>
                      <td className="px-5 py-4 text-muted">{order.customer}</td>
                      <td className="px-5 py-4">{order.product}</td>
                      <td className="px-5 py-4 text-right font-extrabold">{order.amount.toLocaleString("vi-VN")}đ</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`rounded-full px-2 py-1 text-xs font-extrabold ${statusColor[order.status] || "bg-gray-50 text-gray-600"}`}>
                          {statusLabel[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
