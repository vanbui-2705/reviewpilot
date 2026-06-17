import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDefaultShop } from "@/lib/db-services";

export async function GET() {
  try {
    const shop = await getDefaultShop();
    if (!shop) return NextResponse.json({ ok: true, reviews: [] });

    const reviews = await db.shopReview.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        reviewerName: true,
        rating: true,
        content: true,
        status: true,
        createdAt: true,
        productId: true,
      },
    });

    const shopProducts = await db.shopeeProduct.findMany({
      where: { shopId: shop.id },
      select: { id: true, itemId: true, name: true },
      take: 50,
    });

    const productMap = new Map(shopProducts.map((p: { id: string; name: string }) => [p.id, p.name]));

    const enriched = reviews.map((r: { id: string; reviewerName: string; rating: number; content: string; status: string; createdAt: Date | null; productId: string | null }) => ({
      id: r.id,
      reviewerName: r.reviewerName,
      rating: r.rating,
      content: r.content,
      status: r.status,
      productName: productMap.get(r.productId || "") || "Sản phẩm không xác định",
      createdAt: r.createdAt?.toISOString() ?? null,
      needsAction: r.rating <= 3 && r.status === "pending",
    }));

    return NextResponse.json({ ok: true, reviews: enriched });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
