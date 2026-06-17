import { NextResponse } from "next/server";
import { searchShopee, listShops, createShop } from "@/lib/shopee/service";

// GET: no q param → list all shops; with q param → search Shopee public API
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q");

    if (!q) {
      const shops = await listShops();
      return NextResponse.json({ success: true, data: shops });
    }

    const page = parseInt(url.searchParams.get("page") ?? "0", 10);
    const results = await searchShopee(q, isNaN(page) ? 0 : page);
    return NextResponse.json({ success: true, data: results });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to fetch" },
      { status: 500 }
    );
  }
}

// POST: create a new shop
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, shopeeUrl, shopeeShopId, plan, monthlyQuota, userId } =
      body ?? {};

    if (!name || !shopeeUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, shopeeUrl" },
        { status: 400 }
      );
    }

    const shop = await createShop({
      name,
      shopeeUrl,
      shopeeShopId,
      plan,
      monthlyQuota,
      userId,
    });

    return NextResponse.json({ success: true, data: shop }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to create shop" },
      { status: 500 }
    );
  }
}
