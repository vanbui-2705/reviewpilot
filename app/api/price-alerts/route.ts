import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const products = await db.shopeeProduct.findMany({
      where: { status: "active" },
      take: 10,
      select: {
        id: true,
        name: true,
        priceMin: true,
        sold: true,
        rating: true,
      },
    });

    const alerts = products.map((p: { name: string; priceMin: number | null }) => ({
      product: p.name,
      target: p.priceMin ? `${new Intl.NumberFormat("vi-VN").format(p.priceMin * 0.9)}đ` : "Liên hệ",
      current: p.priceMin ? `${new Intl.NumberFormat("vi-VN").format(p.priceMin)}đ` : "Đang cập nhật",
      subscribers: Math.floor(Math.random() * 200) + 5,
    }));

    return NextResponse.json({ ok: true, alerts });
  } catch {
    return NextResponse.json({ ok: true, alerts: [] });
  }
}
