import { NextResponse } from "next/server";
import { searchMarketplaceOffers } from "@/lib/market-search";
import { searchShopee } from "@/lib/shopee/service";

function fallbackResults(query: string) {
  return searchMarketplaceOffers(query).map((offer, index) => ({
    item_basic: {
      itemid: 900000 + index,
      shopid: 700000 + index,
      name: offer.title,
      image: offer.image,
      price: offer.price * 100000,
      price_max: offer.price * 100000,
      price_before_discount: offer.oldPrice * 100000,
      stock: 50 + index * 12,
      sold: offer.sold,
      liked_count: 20 + index * 8,
      rating_star: offer.rating,
      item_rating: { rating_count: [0, 1, 2, 5, 16, 42 + index] },
    },
  }));
}

function keywordFromInput(query: string) {
  if (!query.includes("shopee.vn")) return query;

  try {
    const urlPath = new URL(query).pathname;
    const nameFromUrl = urlPath.split("/").pop() || "";
    return nameFromUrl.replace(/-i\.\d+\.\d+.*/, "").replace(/-/g, " ").trim() || "sản phẩm";
  } catch {
    return query;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = String(body?.query || "").trim();

    if (!query || query.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Nhập từ khóa hoặc link sản phẩm Shopee tối thiểu 2 ký tự." },
        { status: 400 },
      );
    }

    const keyword = keywordFromInput(query);

    try {
      const results = await searchShopee(keyword, 0);
      return NextResponse.json({ ok: true, keyword, results, source: "shopee" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Shopee request failed";
      return NextResponse.json({
        ok: true,
        keyword,
        results: fallbackResults(keyword),
        source: "fallback",
        note: `Shopee đang chặn request trực tiếp (${message}). Hiển thị dữ liệu mô phỏng để khách vẫn test được crawl cơ bản.`,
      });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Không thể xử lý yêu cầu crawl." }, { status: 500 });
  }
}
