import { NextResponse } from "next/server";
import { crawlShopeeShop } from "@/lib/shopee/service";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

    const items = await crawlShopeeShop(url);
    return NextResponse.json({ success: true, items, count: items.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Crawl failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
