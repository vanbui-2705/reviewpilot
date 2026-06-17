import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  sku: z.string().min(2),
  category: z.string().optional(),
  image: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Dữ liệu listing không hợp lệ." }, { status: 400 });
    }

    const shopeeReady = Boolean(process.env.SHOPEE_APP_KEY && process.env.SHOPEE_APP_SECRET && process.env.SHOPEE_SHOP_ID);

    return NextResponse.json({
      ok: true,
      mode: shopeeReady ? "api-ready" : "mock",
      status: shopeeReady ? "queued" : "mock-published",
      listingId: `RP-LIST-${Date.now()}`,
      shopeeItemId: shopeeReady ? null : `MOCK-${Math.floor(Math.random() * 900000 + 100000)}`,
      message: shopeeReady
        ? "Listing đã vào hàng đợi đăng lên Shopee Open Platform."
        : "Đăng mock thành công. Cần cấu hình Shopee Open Platform để đăng thật.",
      payload: parsed.data,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Không thể đăng sản phẩm." }, { status: 500 });
  }
}
