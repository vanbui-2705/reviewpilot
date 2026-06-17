import { NextResponse } from "next/server";
import {
  getProductCardsService,
  createProductService,
  getAllBrandsService,
} from "@/lib/product-service";
import { getLowestOffer, formatVnd } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const brand = searchParams.get("brand")?.trim() ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);

  const { items, total } = await getProductCardsService({
    page,
    limit,
    search,
    brand,
    sort,
  });

  const products = items.map((p) => {
    const lowest = getLowestOffer(p);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      model: p.model,
      storage: p.storage,
      imageUrl: p.imageUrl,
      shortDescription: p.shortDescription,
      lowestPrice: lowest.price,
      offerCount: p.offers.length,
      url: `/products/${p.slug}`,
    };
  });

  const brands = search === "" && brand === ""
    ? await getAllBrandsService()
    : [];

  return NextResponse.json({ ok: true, products, total, page, limit, brands });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, brand, model, imageUrl, shortDescription, specs } = body;

    if (!name || !brand) {
      return NextResponse.json(
        { ok: false, error: "name and brand are required" },
        { status: 400 }
      );
    }

    const product = await createProductService({
      name,
      brand,
      model,
      imageUrl,
      shortDescription,
      specs,
    });

    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (err) {
    console.error("POST /api/products error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
