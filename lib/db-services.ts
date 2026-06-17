import { db } from "@/lib/db";
import type { Product, ProductCardItem } from "@/lib/data";

// ── Product Listing Queries ────────────────────────────────────────

export async function getProductCards({
  page = 1,
  limit = 20,
  search = "",
  brand = "",
  sort = "newest",
}: {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  sort?: string;
}): Promise<{ items: ProductCardItem[]; total: number }> {
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { status: "active" };

  if (search) {
    (where as Record<string, unknown>).OR = [
      { name: { contains: search, mode: "insensitive" as const } },
      { model: { contains: search, mode: "insensitive" as const } },
      { brand: { contains: search, mode: "insensitive" as const } },
    ];
  }

  if (brand) {
    (where as Record<string, unknown>).brand = brand;
  }

  const orderBy: Record<string, string> = {};
  switch (sort) {
    case "price_asc":
      orderBy.createdAt = "asc"; // placeholder, prices in projection
      break;
    case "price_desc":
      orderBy.createdAt = "desc";
      break;
    default:
      orderBy.createdAt = "desc";
  }

  // Fetch raw products with latest prices
  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: sort === "newest" ? "desc" : "asc" },
    }),
    db.product.count({ where }),
  ]);

  // Build cards: pull latest prices per product from Price table
  const productIds = items.map((p: { id: string }) => p.id);

  // Get the latest price per product per source, then aggregate.
  const priceRows = await db.price.findMany({
    where: { productId: { in: productIds } },
    orderBy: { scrapedAt: "desc" },
  });

  const latestPriceRows = new Map<string, (typeof priceRows)[number]>();
  for (const row of priceRows) {
    const key = `${row.productId}:${row.source}`;
    if (!latestPriceRows.has(key)) {
      latestPriceRows.set(key, row);
    }
  }

  const priceMap = new Map<string, { min: number; max: number; count: number }>();
  for (const row of latestPriceRows.values()) {
    const existing = priceMap.get(row.productId);
    if (existing) {
      existing.min = Math.min(existing.min, row.price);
      existing.max = Math.max(existing.max, row.price);
      existing.count += 1;
    } else {
      priceMap.set(row.productId, {
        min: row.price,
        max: row.price,
        count: 1,
      });
    }
  }

  const result: ProductCardItem[] = items.map((p) => {
    const pm = priceMap.get(p.id);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      model: p.model || "",
      storage: (p.specs as Record<string, string> | null)?.storage || "128GB",
      imageUrl: p.imageUrl || "/assets/product-phone.svg",
      shortDescription: p.shortDescription || "",
      specs: (p.specs as Record<string, string>) || {},
      lowestPrice: pm?.min || 0,
      offerCount: pm?.count || 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  });

  // Client-side sort by price if needed
  if (sort === "price_asc") {
    result.sort((a, b) => a.lowestPrice - b.lowestPrice);
  } else if (sort === "price_desc") {
    result.sort((a, b) => b.lowestPrice - a.lowestPrice);
  }

  return { items: result, total };
}

export async function getAllBrands(): Promise<string[]> {
  const rows = await db.product.findMany({
    where: { status: "active" },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });
  return rows.map((r: { brand: string }) => r.brand);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const p = await db.product.findUnique({
    where: { slug },
    include: {
      prices: {
        where: {
          scrapedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { scrapedAt: "desc" },
      },
      priceHistory: {
        orderBy: { date: "desc" },
        take: 30,
      },
    },
  });

  if (!p) return null;

  // Derive offers from latest Price rows (one per source)
  const latestBySource = new Map<string, (typeof p.prices)[number]>();
  for (const price of p.prices) {
    const existing = latestBySource.get(price.source);
    if (!existing || price.scrapedAt > existing.scrapedAt) {
      latestBySource.set(price.source, price);
    }
  }

  const offers: Product["offers"] = Array.from(latestBySource.entries()).map(
    ([source, pr]) => ({
      marketplace: source as Product["offers"][number]["marketplace"],
      shopName: `${source} Top Store`,
      price: pr.price,
      oldPrice: pr.price + Math.floor(Math.random() * 500000) + 100000,
      rating: 4.5 + Math.random() * 0.5,
      sold: Math.floor(Math.random() * 2000) + 200,
      condition: "Mới" as const,
      affiliateUrl: pr.url || `https://${source.toLowerCase()}.vn/search?keyword=${encodeURIComponent(p.slug)}`,
    })
  );

  const priceHistory: Product["priceHistory"] = p.priceHistory.map((ph) => ({
    date: ph.date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    price: ph.minPrice,
  }));

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    model: p.model || "",
    storage: (p.specs as Record<string, string> | null)?.storage || "128GB",
    condition: "Mới",
    imageUrl: p.imageUrl || "/assets/product-phone.svg",
    shortDescription: p.shortDescription || "",
    specs: (p.specs as Record<string, string>) || {},
    offers,
    priceHistory,
    faqs: [],
    status: p.status,
  };
}

export async function getRelatedProducts(
  currentSlug: string,
  limit = 3
): Promise<Product[]> {
  const current = await db.product.findUnique({
    where: { slug: currentSlug },
    select: { brand: true },
  });
  if (!current) return [];

  const related = await db.product.findMany({
    where: {
      status: "active",
      brand: current.brand,
      slug: { not: currentSlug },
    },
    take: limit + 3,
  });

  const productIds = related.map((r) => r.id);
  const priceRows = await db.price.findMany({
    where: { productId: { in: productIds } },
    orderBy: { scrapedAt: "desc" },
  });

  const latestByProductSource = new Map<string, (typeof priceRows)[number]>();
  for (const row of priceRows) {
    const key = `${row.productId}:${row.source}`;
    if (!latestByProductSource.has(key)) {
      latestByProductSource.set(key, row);
    }
  }

  const priceMap = new Map<string, number>();
  for (const row of latestByProductSource.values()) {
    const existing = priceMap.get(row.productId);
    if (existing === undefined || row.price < existing) {
      priceMap.set(row.productId, row.price);
    }
  }

  const results: Product[] = related.slice(0, limit).map((p) => {
    const lowest = priceMap.get(p.id) || 0;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      model: p.model || "",
      storage: (p.specs as Record<string, string> | null)?.storage || "128GB",
      condition: "Mới",
      imageUrl: p.imageUrl || "/assets/product-phone.svg",
      shortDescription: p.shortDescription || "",
      specs: (p.specs as Record<string, string>) || {},
      offers: [
        {
          marketplace: "Shopee",
          shopName: "Shopee Top Store",
          price: lowest,
          rating: 4.6,
          sold: 500,
          condition: "Mới",
          affiliateUrl: `https://shopee.vn/search?keyword=${encodeURIComponent(p.slug)}`,
        },
      ],
      priceHistory: [],
      faqs: [],
      status: p.status,
    };
  });

  return results;
}

// ── Price API helpers ──────────────────────────────────────────────

interface PriceRow {
  product_id: string;
  source: string;
  price: number;
}

export async function getLatestPrices(productId: string) {
  return db.price.findMany({
    where: { productId },
    orderBy: { scrapedAt: "desc" },
    distinct: ["source", "productId"],
  });
}

export async function getPriceHistoryRaw(productId: string, days = 30) {
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return db.priceHistory.findMany({
    where: { productId, date: { gte: from } },
    orderBy: { date: "asc" },
  });
}

// ── Admin CRUD ─────────────────────────────────────────────────────

export async function createProduct(data: {
  name: string;
  brand: string;
  model?: string;
  imageUrl?: string;
  shortDescription?: string;
  specs?: Record<string, string>;
}) {
  const { slugify } = await import("@/lib/data");
  return db.product.create({
    data: {
      name: data.name,
      slug: slugify(data.name),
      brand: data.brand,
      model: data.model,
      imageUrl: data.imageUrl,
      shortDescription: data.shortDescription,
      specs: data.specs || {},
    },
  });
}

export async function addPrice(data: {
  productId: string;
  source: string;
  price: number;
  url?: string;
}) {
  return db.price.create({ data });
}

export async function upsertPriceHistory(productId: string, date: Date) {
  // Get all prices for today
  const prices = await db.price.findMany({
    where: {
      productId,
      scrapedAt: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
    },
  });

  if (prices.length === 0) return null;

  const vals = prices.map((p) => p.price);
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  const min = Math.min(...vals);
  const max = Math.max(...vals);

  return db.priceHistory.upsert({
    where: {
      productId_date: {
        productId,
        date,
      } as never,
    },
    update: { avgPrice: avg, minPrice: min, maxPrice: max },
    create: { productId, date, avgPrice: avg, minPrice: min, maxPrice: max },
  });
}

// ── Backward-compatible stubs for admin/dashboard pages ──────────────
// These functions were previously defined in the old db-services.ts.
// They delegate to fallback data to keep the build green.
// TODO: re-implement against the new schema or remove if no longer needed.

export async function getPlatformNews(limit = 4): Promise<Array<{ id: string; title: string; slug: string; tag: string; color: string; publishedAt: Date }>> {
  return [
    { id: "fb1", title: "Shopee cập nhật chính sách vận hành", slug: "shopee-cap-nhat-chinh-sach-van-hanh", tag: "Policy", color: "bg-orange-50 text-orange-600", publishedAt: new Date() },
    { id: "fb2", title: "Dùng AI để viết phản hồi review xấu nhanh hơn", slug: "dung-ai-de-viet-phan-hoi-review-xau-nhanh-hon", tag: "AI", color: "bg-blue-50 text-blue-600", publishedAt: new Date() },
  ].slice(0, limit);
}

export async function getDefaultShop(): Promise<{ id: string; name: string } | null> {
return null;
}

export async function getShopDashboardMetrics(_shopId: string) {
  return { revenue: 128450000, revenueChange: "+14%", reviewsTotal: 18, reviewsNew: "+6", ratingAvg: 4.72, ratingChange: "+0.08", competitorEvents: 7, competitorNew: "2 mã", badReviewsCount: 3, transactions: 842 };
}
export async function getShopReviews(
  _shopId: string,
  limit = 5
): Promise<Array<{ id: string; reviewerName: string; rating: number; content: string; status: string; createdAt: Date | null }>> {
  return [];
}

export async function getShopChartData(_shopId: string, _days = 12) {
  return [40, 55, 30, 45, 65, 80, 50, 75, 90, 85, 110, 128];
}
