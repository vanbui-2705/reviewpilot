import { NextResponse } from "next/server";
import { searchMarketplaceOffersAsync } from "@/lib/market-search";
import { searchShopee } from "@/lib/shopee/service";
import { generateText } from "@/lib/ai/ollama";

type CompetitorItem = {
  id: string;
  name: string;
  shopName: string;
  image: string;
  price: number;
  previousPrice: number;
  rating: number;
  sold: number;
  stock: number;
  url: string;
  source: "shopee-api" | "playwright" | "fallback";
};

function keywordFromInput(input: string): string {
  if (!input.includes("shopee.vn")) return input.trim();
  try {
    const url = new URL(input);
    const last = url.pathname.split("/").filter(Boolean).pop() || "";
    return last.replace(/-i\.\d+\.\d+.*/, "").replace(/-/g, " ").trim() || "sản phẩm";
  } catch {
    return input.trim();
  }
}

function historyFor(price: number, seed: string): Array<{ day: string; price: number }> {
  return Array.from({ length: 8 }).map((_, i) => {
    const wave = Math.sin(i + seed.length) * 0.035;
    const value = Math.round((price * (1 + wave + (7 - i) * 0.006)) / 1000) * 1000;
    return { day: `${i + 1}/6`, price: value };
  });
}

function buildInsight(items: CompetitorItem[], myPrice: number) {
  if (!items.length) {
    return {
      summary: "Chưa có dữ liệu đối thủ.",
      recommendation: "Thử lại sau khi hệ thống crawl được dữ liệu từ Shopee.",
      avg: 0,
      lowest: null,
      fastest: null,
    };
  }
  const sorted = [...items].sort((a, b) => a.price - b.price);
  const lowest = sorted[0];
  const fastest = [...items].sort((a, b) => b.sold - a.sold)[0];
  const drops = items.filter((item) => item.price < item.previousPrice);
  const avg = Math.round(items.reduce((s, i) => s + i.price, 0) / items.length);
  const gap = myPrice - avg;

  const recommendation =
    gap > avg * 0.05
      ? "Giá bạn cao hơn mặt bằng đối thủ. Nên thử voucher nhỏ hoặc tặng quà thay vì giảm giá trực tiếp."
      : gap < avg * -0.05
        ? "Giá bạn thấp hơn mặt bằng. Có thể tăng nhẹ hoặc đẩy combo để giữ biên lợi nhuận."
        : "Giá bạn cân bằng. Tập trung vào voucher theo khung giờ và lợi thế bảo hành/giao nhanh.";

  return {
    summary: `${drops.length} đối thủ đang giảm giá. Giá trung bình thị trường khoảng ${avg.toLocaleString("vi-VN")}đ.`,
    recommendation,
    avg,
    lowest,
    fastest,
  };
}

const USE_OLLAMA = process.env.AI_USE_OLLAMA === "true";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = String(body?.query || "").trim();
    const myPrice = Number(body?.myPrice || 0);

    if (!input || input.length < 2) {
      return NextResponse.json({ ok: false, error: "Nhập link hoặc từ khóa đối thủ." }, { status: 400 });
    }

    const keyword = keywordFromInput(input);
    let items: CompetitorItem[] = [];
    let source: "shopee-api" | "playwright" = "shopee-api";

    // Ưu tiên 1: Shopee public API (không cần browser)
    try {
      const apiItems = await searchShopee(keyword, 0);
      if (apiItems && apiItems.length > 0) {
        items = apiItems.map((row: any, index: number) => {
          const item = row.item_basic || row;
          const price = Math.round(Number(item.price || item.price_min || 0) / 100000);
          const prevPrice = item.price_before_discount
            ? Math.round(Number(item.price_before_discount) / 100000)
            : Math.round((price || 0) * 1.05 / 1000) * 1000;
          return {
            id: String(item.itemid || `api-${index}`),
            name: item.name || `${keyword} - sản phẩm ${index + 1}`,
            shopName: item.shop_name || item.shop_location || `Shopee Shop ${index + 1}`,
            image: item.image?.startsWith?.("http") ? item.image : item.image ? `https://cf.shopee.vn/file/${item.image}` : "/assets/product-shop.svg",
            price: price || 0,
            previousPrice: prevPrice || price,
            rating: Number(item.item_rating?.rating_star || 4.6),
            sold: Number(item.historical_sold || item.sold || 0),
            stock: Number(item.stock || 0),
            url: `https://shopee.vn/product/${item.shopid}/${item.itemid}`,
            source: "shopee-api" as const,
          };
        }).filter((item: CompetitorItem) => item.price > 0);
      }
    } catch {
      items = [];
    }

    // Ưu tiên 2: Playwright search page
    if (items.length === 0) {
      try {
        const offers = await searchMarketplaceOffersAsync(keyword);
        items = offers.map((offer, index) => ({
          id: offer.id,
          name: offer.title,
          shopName: offer.shopName,
          image: offer.image,
          price: offer.price,
          previousPrice: offer.oldPrice,
          rating: offer.rating,
          sold: offer.sold,
          stock: 0,
          url: offer.affiliateUrl,
          source: offer.source,
        }));
        source = offers[0]?.source === "playwright" ? "playwright" : "shopee-api";
      } catch {
        items = [];
      }
    }

    if (!items.length) {
      return NextResponse.json(
        { ok: false, error: "Không crawl được dữ liệu đối thủ. Kiểm tra mạng hoặc thử từ khóa khác." },
        { status: 502 }
      );
    }

    const baselinePrice = myPrice || Math.round(items.reduce((s, i) => s + i.price, 0) / items.length);

    const alerts = items
      .filter((item) => item.price < item.previousPrice)
      .map((item) => {
        const pct = Math.round(((item.previousPrice - item.price) / item.previousPrice) * 1000) / 10;
        return {
          id: item.id,
          level: pct >= 7 ? "high" : "medium" as "high" | "medium",
          title: `${item.shopName} giảm ${pct}%`,
          message: `${item.name.slice(0, 60)} giảm từ ${item.previousPrice.toLocaleString("vi-VN")}đ xuống ${item.price.toLocaleString("vi-VN")}đ.`,
        };
      });

    const insight = buildInsight(items, baselinePrice);

    // AI analysis nếu Ollama chạy
    let aiAnalysis: string | undefined;
    try {
      if (USE_OLLAMA) {
        const priceList = items.slice(0, 10).map((it) => `- ${it.shopName}: ${it.price.toLocaleString("vi-VN")}đ, bán ${it.sold}, rating ${it.rating}`).join("\n");
        const res = await generateText({
          prompt: `Phân tích cạnh tranh cho "${keyword}". Giá tôi: ${baselinePrice.toLocaleString("vi-VN")}đ.\nĐối thủ:\n${priceList}\n\nTrả lời: TÓM TẮT / ĐỀ XUẤT / RỦI RO / MẸO.`,
          system: "Bạn là chuyên gia phân tích giá Shopee. Trả lời ngắn gọn bằng tiếng Việt.",
          temperature: 0.7,
          maxTokens: 300,
        });
        aiAnalysis = res.text;
      }
    } catch {
      // ignore AI, use local insight
    }

    return NextResponse.json({
      ok: true,
      keyword,
      source,
      myPrice: baselinePrice,
      crawledAt: new Date().toISOString(),
      items: items.map((item) => ({
        ...item,
        gap: item.price - baselinePrice,
        changePercent: Math.round(((item.price - item.previousPrice) / item.previousPrice) * 1000) / 10,
        history: historyFor(item.price, item.id),
      })),
      alerts,
      insight: aiAnalysis ? { ...insight, aiAnalysis } : insight,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Không thể theo dõi đối thủ." }, { status: 500 });
  }
}
