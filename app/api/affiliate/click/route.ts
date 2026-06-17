import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  productId: z.string().min(1),
  url: z.string().url()
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Payload không hợp lệ." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    trackedAt: new Date().toISOString(),
    ...parsed.data
  });
}
