import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai/ollama";
import { createProductDescription, createSeoTitles } from "@/lib/ai/local-tools";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2).max(200),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().nonnegative().optional(),
  category: z.string().optional(),
  features: z.string().optional(),
});

const USE_OLLAMA = process.env.AI_USE_OLLAMA === "true";

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
        { status: 400 }
      );
    }

    const { name, price, stock, category, features } = parsed.data;

    let description: string;
    let model = "local-fallback";
    let tokensUsed: number | undefined;

    try {
      if (!USE_OLLAMA) throw new Error("Use local AI fallback");
      const result = await generateText({
        prompt: `Viết mô tả sản phẩm Shopee:
- Tên: ${name}
- Giá: ${price.toLocaleString("vi-VN")}đ
- Danh mục: ${category || "chung"}
- Tính năng: ${features || "không có thông tin thêm"}

Trả về mô tả duy nhất, không giải thích.`,
        system: "Bạn là chuyên gia viết mô tả sản phẩm Shopee. Viết bằng tiếng Việt, lợi ích mở đầu, bullet tính năng, CTA cuối bài.",
        temperature: 0.9,
        maxTokens: 400,
      });
      description = result.text;
      model = result.model;
      tokensUsed = result.tokensUsed;
    } catch {
      description = createProductDescription({ name, features, category });
    }

    const seoTitles = createSeoTitles({ name, keywords: category });

    const defaultShopId = await db.shop.findFirst().then((s: { id: string } | null | undefined) => s?.id ?? "");

    const product = await db.shopeeProduct.create({
      data: {
        itemId: `manual-${Date.now()}`,
        name,
        slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}-${Date.now()}`.slice(0, 90),
        priceMin: price,
        priceMax: price,
        stock: stock ?? 100,
        status: "active",
        url: "",
        shopeeUrl: "",
        shopId: defaultShopId,
        image: "/assets/product-shop.svg",
        imageThumb: "/assets/product-shop.svg",
      },
    });

    return NextResponse.json({
      ok: true,
      product: {
        id: product.id,
        name: product.name,
        price,
        description,
        seoTitles,
        model,
        tokensUsed,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Không thể tạo sản phẩm." },
      { status: 500 }
    );
  }
}
