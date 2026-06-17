import { Download, Filter } from "lucide-react";
import { orders } from "@/lib/data";

const sourceFromId = (id: string) => (id.startsWith("SPX") ? "Shopee" : id.startsWith("LZD") ? "Lazada" : "Tiki");

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-extrabold uppercase tracking-wide text-shopee">Orders</p>
          <h1 className="mt-2 text-3xl font-extrabold">Đơn hàng và doanh thu</h1>
          <p className="mt-1 text-sm text-muted">Mock order dashboard để sau này nối Shopee/Lazada/Tiki Merchant API.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline"><Filter className="h-4 w-4" />Lọc</button>
          <button className="btn-primary"><Download className="h-4 w-4" />Export CSV</button>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-soft text-left text-muted">
              <tr>
                <th className="px-5 py-3 font-bold">Mã đơn</th>
                <th className="px-5 py-3 font-bold">Sàn</th>
                <th className="px-5 py-3 font-bold">Khách hàng</th>
                <th className="px-5 py-3 font-bold">Sản phẩm</th>
                <th className="px-5 py-3 text-right font-bold">Giá trị</th>
                <th className="px-5 py-3 font-bold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-line">
                  <td className="px-5 py-4 font-extrabold">{order.id}</td>
                  <td className="px-5 py-4"><span className="badge">{sourceFromId(order.id)}</span></td>
                  <td className="px-5 py-4 text-muted">{order.customer}</td>
                  <td className="px-5 py-4">{order.product}</td>
                  <td className="px-5 py-4 text-right font-extrabold text-shopee">{order.amount}</td>
                  <td className="px-5 py-4"><span className="badge-shopee">{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
