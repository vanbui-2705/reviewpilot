import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai/ollama";
import { analyzePrice, isWeakGeneratedText } from "@/lib/ai/local-tools";
import { searchMarketplaceOffers } from "@/lib/market-search";
import { crawlShopeeProduct } from "@/lib/crawler";

const schema = z.object({
  productUrl: z.string().optional(),
  productName: z.string().min(2).max(200).optional(),
  myPrice: z.coerce.number().positive().optional(),
  competitorPrices: z.array(
    z.object({
      shopName: z.string(),
      price: z.coerce.number().positive(),
      sold: z.coerce.number().optional(),
      rating: z.coerce.number().optional(),
    })
  ).optional(),
});

const SYSTEM_PROMPT = `Bạn là chuyên gia phân tích giá cạnh tranh cho chủ shop Shopee.
Phân tích ngắn gọn bằng tiếng Việt, có số liệu cụ thể và đề xuất giá hành động được.`;

const USE_OLLAMA = process.env.AI_USE_OLLAMA === "true";

function keywordFromInput(input: string) {
  if (!input.includes("shopee.vn")) return input;

  try {
    const url = new URL(input);
    const last = url.pathname.split("/").filter(Boolean).pop() || "";
    return last.replace(/-i\.\d+\.\d+.*/, "").replace(/-/g, " ").trim() || "sản phẩm";
  } catch {
    return input;
  }
}

function extractPriceNumber(value: string | undefined) {
  if (!value) return 0;
  const digits = value.replace(/[^\d]/g, "");
  return Number(digits || 0);
}

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
        { status: 400 }
      );
    }

    const { productUrl } = parsed.data;
    let productName = parsed.data.productName?.trim() || "";
    let myPrice = parsed.data.myPrice || 0;
    let competitorPrices = parsed.data.competitorPrices || [];

    if (productUrl?.trim()) {
      const keyword = keywordFromInput(productUrl.trim());
      productName ||= keyword;

      if (productUrl.includes("shopee.vn")) {
        const crawled = await crawlShopeeProduct(productUrl);
        if (crawled.ok && "title" in crawled) {
          productName = crawled.title || productName;
          myPrice ||= extractPriceNumber(crawled.price);
        }
      }

      const offers = searchMarketplaceOffers(productName || keyword);
      if (!myPrice && offers[0]) myPrice = offers[0].price;
      competitorPrices = offers.map((offer) => ({
        shopName: offer.shopName,
        price: offer.price,
        sold: offer.sold,
        rating: offer.rating,
      }));
    }

    if (!productName || productName.length < 2 || !myPrice || !competitorPrices.length) {
      return NextResponse.json(
        { ok: false, error: "Cần có link sản phẩm, hoặc tên sản phẩm + giá + danh sách đối thủ." },
        { status: 400 }
      );
    }

    const local = analyzePrice({ productName, myPrice, competitorPrices });
    const priceList = competitorPrices
      .map((item) => `- ${item.shopName}: ${item.price.toLocaleString("vi-VN")}đ, đã bán ${item.sold ?? "?"}, rating ${item.rating ?? "?"}`)
      .join("\n");

    let result: { text: string; model: string; tokensUsed?: number };
    try {
      if (!USE_OLLAMA) throw new Error("Use local AI fallback");
      result = await generateText({
        prompt: `Phân tích giá cho "${productName}". Giá của tôi: ${myPrice.toLocaleString("vi-VN")}đ.
Đối thủ:
${priceList}

Trả lời theo format TÓM TẮT / ĐỀ XUẤT / RỦI RO / MẸO.`,
        system: SYSTEM_PROMPT,
        temperature: 0.7,
        maxTokens: 100,
      });
      if (isWeakGeneratedText(result.text)) {
        result = { text: local.text, model: "local-fallback" };
      }
    } catch {
      result = { text: local.text, model: "local-fallback" };
    }

    return NextResponse.json({
      ok: true,
      analysis: result.text,
      stats: local.stats,
      competitorCount: competitorPrices.length,
      comparedOffers: competitorPrices,
      product: { name: productName, price: myPrice, url: productUrl || null },
      tokensUsed: result.tokensUsed,
      model: result.model,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Không thể phân tích giá." },
      { status: 500 }
    );
  }
}
