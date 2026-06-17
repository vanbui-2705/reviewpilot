import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getLowestOffer, formatVnd } from "@/lib/data";

// ── GET /api/prices?product_id=X ────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("product_id");

  if (!productId) {
    // Return aggregated price list across all products
    const products = await db.product.findMany({
      where: { status: "active" },
      select: { id: true, name: true, slug: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const priceRows = await db.price.findMany({
      where: { productId: { in: products.map((p) => p.id) } },
      orderBy: { scrapedAt: "desc" },
    });

    const latestByProductSource = new Map<string, (typeof priceRows)[number]>();
    for (const row of priceRows) {
      const key = `${row.productId}:${row.source}`;
      if (!latestByProductSource.has(key)) {
        latestByProductSource.set(key, row);
      }
    }

    const priceMap = new Map<string, { min: number; count: number; source: string; url: string }>();
    for (const row of latestByProductSource.values()) {
      const existing = priceMap.get(row.productId);
      if (!existing) {
        priceMap.set(row.productId, {
          min: row.price,
          count: 1,
          source: row.source,
          url: row.url ?? "",
        });
      } else {
        existing.count += 1;
        if (row.price < existing.min) {
          existing.min = row.price;
          existing.source = row.source;
          existing.url = row.url ?? "";
        }
      }
    }

    const result = products.map((p) => {
      const pm = priceMap.get(p.id);
      return {
        productId: p.id,
        name: p.name,
        slug: p.slug,
        currentBestPrice: pm?.min || 0,
        marketplace: pm?.source || "",
        offerCount: pm?.count || 0,
        affiliateUrl: pm?.url || `/products/${p.slug}`,
      };
    });

    return NextResponse.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      prices: result,
    });
  }

  // Single product price detail
  const prices = await db.price.findMany({
    where: { productId },
    orderBy: { scrapedAt: "desc" },
  });

  // Deduplicate: keep latest per source
  const seen = new Map<string, (typeof prices)[number]>();
  for (const p of prices) {
    const existing = seen.get(p.source);
    if (!existing || p.scrapedAt > existing.scrapedAt) seen.set(p.source, p);
  }

  const latestPrices = Array.from(seen.values()).map((p) => ({
    id: p.id,
    source: p.source,
    price: p.price,
    url: p.url ?? "",
    scrapedAt: p.scrapedAt.toISOString(),
  }));

  return NextResponse.json({
    ok: true,
    productId,
    updatedAt: new Date().toISOString(),
    prices: latestPrices,
  });
}
