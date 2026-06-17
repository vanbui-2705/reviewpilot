import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const products = await db.shopeeProduct.findMany({
      where: { status: "active" },
      take: 8,
      orderBy: { sold: "desc" },
      select: {
        id: true,
        itemId: true,
        name: true,
        image: true,
        priceMin: true,
        priceMax: true,
        sold: true,
        rating: true,
        url: true,
        shopeeUrl: true,
      },
    });

    return NextResponse.json({
      ok: true,
      products: products.map((p: { id: string; itemId: string; name: string; image: string | null; priceMin: number | null; priceMax: number | null; sold: number | null; rating: number | null; url: string | null; shopeeUrl: string | null }) => ({
        id: p.id,
        itemId: p.itemId,
        name: p.name,
        image: p.image || "",
        price: p.priceMin ?? 0,
        priceMax: p.priceMax ?? p.priceMin ?? 0,
        sold: p.sold ?? 0,
        rating: p.rating ?? 0,
        url: p.url,
        shopeeUrl: p.shopeeUrl,
        commission: "Up to 10%",
        category: "Shopee",
        score: p.rating ? p.rating.toFixed(1) : "N/A",
        affiliateUrl: p.shopeeUrl || p.url,
      })),
    });
  } catch {
    return NextResponse.json({ ok: true, products: [] });
  }
}
