"use client";

import { ExternalLink, TrendingDown } from "lucide-react";
import { formatVnd, getLowestOffer, type Product } from "@/lib/data";

export function PriceComparison({ product }: { product: Product }) {
  const sortedOffers = [...product.offers].sort((a, b) => a.price - b.price);
  const lowest = getLowestOffer(product);
  const highest = sortedOffers[sortedOffers.length - 1];
  const saving = highest.price - lowest.price;

  async function track(productId: string, marketplace: string, url: string) {
    await fetch("/api/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, marketplace, url })
    });
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line bg-soft p-4">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-extrabold">Bảng so sánh giá</h2>
            <p className="text-sm text-muted">Sắp xếp từ rẻ nhất đến đắt nhất, nút xem giá là link affiliate.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-sm font-extrabold text-leaf">
            <TrendingDown className="h-4 w-4" />
            Tiết kiệm đến {formatVnd(saving)}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-white text-left text-muted">
            <tr>
              <th className="p-4">Sàn</th>
              <th className="p-4">Shop</th>
              <th className="p-4">Tình trạng</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Đã bán</th>
              <th className="p-4">Giá</th>
              <th className="p-4">Mua</th>
            </tr>
          </thead>
          <tbody>
            {sortedOffers.map((offer) => {
              const isLowest = offer.price === lowest.price;
              return (
                <tr key={`${offer.marketplace}-${offer.shopName}`} className="border-t border-line">
                  <td className="p-4 font-extrabold">{offer.marketplace}</td>
                  <td className="p-4">{offer.shopName}</td>
                  <td className="p-4">{offer.condition}</td>
                  <td className="p-4">{offer.rating}</td>
                  <td className="p-4">{offer.sold.toLocaleString("vi-VN")}</td>
                  <td className="p-4">
                    <div className="font-extrabold text-shopee">{formatVnd(offer.price)}</div>
                    {isLowest ? <span className="text-xs font-extrabold text-leaf">Rẻ nhất</span> : null}
                  </td>
                  <td className="p-4">
                    <a
                      href={offer.affiliateUrl}
                      target="_blank"
                      rel="nofollow sponsored noopener"
                      onClick={() => track(product.id, offer.marketplace, offer.affiliateUrl)}
                      className="inline-flex items-center gap-2 rounded-ui bg-shopee px-3 py-2 font-extrabold text-white"
                    >
                      Xem ngay
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
