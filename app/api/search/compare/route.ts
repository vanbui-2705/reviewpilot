import { NextResponse } from "next/server";
import { z } from "zod";
import { summarizeComparison } from "@/lib/market-search";

const postSchema = z.object({
  query: z.string().min(2)
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (query.trim().length < 2) {
    return NextResponse.json({ ok: false, error: "Nhập tối thiểu 2 ký tự." }, { status: 400 });
  }

  return NextResponse.json(summarizeComparison(query));
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = postSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Tên sản phẩm không hợp lệ." }, { status: 400 });
  }

  return NextResponse.json(summarizeComparison(parsed.data.query));
}
