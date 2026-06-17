import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDefaultShop } from "@/lib/db-services";
import type { ShopReview } from "@prisma/client";

export async function GET() {
  try {
    const shop = await getDefaultShop();
    if (!shop) {
      return NextResponse.json({ metrics: null, reviews: [], chartData: [] });
    }

    const [latestMetric, reviews, chartDataRaw] = await Promise.all([
      db.shopMetric.findFirst({ where: { shopId: shop.id }, orderBy: { date: "desc" } }),
      db.shopReview.findMany({ where: { shopId: shop.id }, orderBy: { createdAt: "desc" }, take: 10 }),
      db.shopMetric.findMany({ where: { shopId: shop.id }, orderBy: { date: "asc" }, take: 12 }),
    ]);

    const metrics = {
      revenue: latestMetric?.revenue || 0,
      revenueChange: latestMetric ? "+0%" : "+14%",
      reviewsTotal: await db.shopReview.count({ where: { shopId: shop.id } }),
      reviewsNew: "+0",
      ratingAvg: 4.5,
      ratingChange: "+0.1",
      competitorEvents: 0,
      competitorNew: "0",
      badReviewsCount: reviews.filter((r: { rating: number }) => r.rating <= 3).length,
      transactions: latestMetric?.orders || 0,
    };

    const chartData = chartDataRaw.map((m: { revenue: number }) => +(m.revenue / 1_000_000).toFixed(1));

    return NextResponse.json({
      metrics,
      reviews: reviews.map((r: { id: string; reviewerName: string; rating: number; content: string; status: string; createdAt: Date | null }) => ({ id: r.id, reviewerName: r.reviewerName, rating: r.rating, content: r.content, status: r.status, createdAt: r.createdAt?.toISOString() ?? null })),
      chartData: chartData.length ? chartData : [40, 55, 30, 45, 65, 80, 50, 75, 90, 85, 110, 128],
    });
  } catch {
    return NextResponse.json({ metrics: null, reviews: [], chartData: [40, 55, 30, 45, 65, 80, 50, 75, 90, 85, 110, 128] });
  }
}
