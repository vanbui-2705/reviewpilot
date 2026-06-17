import { NextResponse } from "next/server";
import { crawlShopeeShop, getProductsByShop, getShop, saveCrawlResults } from "@/lib/shopee/service";

type RouteContext = { params: { id: string } };

export async function POST(_req: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const shop = await getShop(id);
    if (!shop) return NextResponse.json({ success: false, error: "Shop not found" }, { status: 404 });

    const items = await crawlShopeeShop(shop.shopeeUrl);
    const result = await saveCrawlResults(id, items);
    return NextResponse.json({ success: true, data: result, items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Crawl failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const products = await getProductsByShop(context.params.id);
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
