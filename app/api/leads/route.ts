import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  contact: z.string().min(1),
  shopUrl: z.string().optional(),
  need: z.string().min(1)
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Thông tin lead không hợp lệ." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    lead: parsed.data,
    receivedAt: new Date().toISOString()
  });
}
