import { NextResponse } from "next/server";
import { z } from "zod";
import { createProductDescription, createSeoTitles } from "@/lib/ai/local-tools";
import { searchMarketplaceOffers } from "@/lib/market-search";
import { crawlShopeeProduct } from "@/lib/crawler";

const schema = z.object({
  source: z.string().min(2).max(1000),
  category: z.string().optional(),
  targetMargin: z.coerce.number().optional(),
});

function keywordFromInput(input: string) {
  if (!input.includes("shopee.vn")) return input.trim();
  try {
    const url = new URL(input);
    const last = url.pathname.split("/").filter(Boolean).pop() || "";
    return last.replace(/-i\.\d+\.\d+.*/, "").replace(/-/g, " ").trim() || "sản phẩm";
  } catch {
    return input.trim();
  }
}

function priceNumber(value?: string) {
  if (!value) return 0;
  return Number(value.replace(/[^\d]/g, "") || 0);
}

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const { source, category, targetMargin = 18 } = parsed.data;
    const keyword = keywordFromInput(source);
    let name = keyword;
    let image = "/assets/product-shop.svg";
    let sourcePrice = 0;

    if (source.includes("shopee.vn")) {
      const crawled = await crawlShopeeProduct(source);
      if (crawled.ok && "title" in crawled) {
        name = crawled.title || keyword;
        image = crawled.image || image;
        sourcePrice = priceNumber(crawled.price);
      }
    }

    const offers = searchMarketplaceOffers(name);
    if (!sourcePrice && offers[0]) sourcePrice = offers[0].price;
    if (!image && offers[0]) image = offers[0].image;

    const recommendedPrice = Math.round((sourcePrice * (1 + targetMargin / 100)) / 1000) * 1000;
    const titles = createSeoTitles({ name, keywords: category || "shopee, giá tốt, hàng sàn" });
    const description = createProductDescription({
      name,
      category,
      features: "Hàng đã kiểm tra trước khi đăng\nMô tả tối ưu SEO\nHỗ trợ tư vấn nhanh\nĐóng gói cẩn thận",
    });

    return NextResponse.json({
      ok: true,
      draft: {
        source,
        sourceType: source.includes("shopee.vn") ? "shopee-link" : "keyword",
        name,
        title: titles[0],
        description,
        category: category || "Chưa chọn danh mục",
        image,
        sourcePrice,
        price: recommendedPrice || sourcePrice,
        stock: 20,
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        weight: 300,
        condition: "Mới / Like new",
        attributes: [
          { name: "Nguồn dữ liệu", value: source.includes("shopee.vn") ? "Crawl từ link" : "Từ khóa" },
          { name: "Biên lợi nhuận mục tiêu", value: `${targetMargin}%` },
        ],
        comparedOffers: offers.slice(0, 3),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Không thể tạo bản nháp listing." }, { status: 500 });
  }
}
