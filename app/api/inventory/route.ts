import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDefaultShop } from "@/lib/db-services";

export async function GET() {
  try {
    const shop = await getDefaultShop();
    if (!shop) return NextResponse.json({ ok: true, items: [] });

    const products = await db.shopeeProduct.findMany({
      where: { shopId: shop.id, status: "active" },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        itemId: true,
        name: true,
        image: true,
        imageThumb: true,
        priceMin: true,
        priceMax: true,
        stock: true,
        sold: true,
        rating: true,
        url: true,
        shopeeUrl: true,
        lastSyncedAt: true,
        status: true,
      },
      take: 100,
    });

    const items = products.map((p) => ({
      id: p.id,
      sku: p.itemId,
      name: p.name,
      image: p.image || p.imageThumb || "",
      price: p.priceMin || 0,
      stock: p.stock ?? 0,
      sold: p.sold ?? 0,
      rating: p.rating ?? 0,
      url: p.shopeeUrl || p.url,
      lastSynced: p.lastSyncedAt?.toISOString() ?? null,
      status: p.status,
      alert:
        p.stock !== null && p.stock !== undefined && p.stock < 5
          ? "Sắp hết"
          : p.stock === 0
            ? "Hết hàng"
            : "Ổn",
    }));

    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sku, name, stock } = body as { sku: string; name: string; stock: number };

    const shop = await getDefaultShop();
    if (!shop) return NextResponse.json({ ok: false, error: "Chưa có shop." }, { status: 400 });

    const updated = await db.shopeeProduct.updateMany({
      where: { shopId: shop.id, itemId: sku },
      data: { stock },
    });

    return NextResponse.json({
      ok: true,
      updated: updated.count,
      message: updated.count > 0 ? `Đã cập nhật ${updated.count} sản phẩm.` : "Không tìm thấy sản phẩm.",
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
