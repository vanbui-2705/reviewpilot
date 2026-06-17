import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDefaultShop } from "@/lib/db-services";

export async function GET() {
  try {
    const shop = await getDefaultShop();
    if (!shop) return NextResponse.json({ ok: true, orders: [] });

    const [shopProducts, metrics] = await Promise.all([
      db.shopeeProduct.findMany({
        where: { shopId: shop.id },
        select: { id: true, name: true, priceMin: true, sold: true },
        take: 50,
      }),
      db.shopMetric.findMany({
        where: { shopId: shop.id },
        orderBy: { date: "desc" },
        take: 20,
      }),
    ]);

    const productNameMap = new Map(shopProducts.map((p) => [p.id, p.name]));

    const orders = metrics
      .filter((m) => m.orders > 0)
      .map((m, idx) => ({
        id: `RP-ORD-${m.date.getTime().toString(36).toUpperCase()}-${idx}`,
        customer: `Khách hàng #${idx + 1}`,
        product: "Sản phẩm Shopee",
        amount: Math.round(m.revenue / (m.orders || 1)),
        status: m.revenue > 0 ? "completed" : "pending",
        createdAt: m.date.toISOString(),
        orders: m.orders,
        revenue: m.revenue,
      }))
      .slice(0, 20);

    return NextResponse.json({ ok: true, orders });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
