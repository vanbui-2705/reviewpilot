import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai/ollama";
import { createSeoTitles } from "@/lib/ai/local-tools";

const schema = z.object({ name: z.string().min(2).max(100), keywords: z.string().optional() });

const SYSTEM_PROMPT = `Bạn là chuyên gia SEO Shopee. Tạo tên sản phẩm ngắn gọn, có từ khóa chính ở đầu, mỗi dòng chỉ là một tiêu đề.`;

const USE_OLLAMA = process.env.AI_USE_OLLAMA === "true";

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const { name, keywords } = parsed.data;
    let titles: string[] = [];
    let model = "local-fallback";
    let tokensUsed: number | undefined;

    try {
      if (!USE_OLLAMA) throw new Error("Use local AI fallback");
      const result = await generateText({
        prompt: `Tạo 5 tên sản phẩm Shopee SEO cho "${name}". Từ khóa phụ: ${keywords || "tự chọn"}. Mỗi tên trên 1 dòng.`,
        system: SYSTEM_PROMPT,
        temperature: 0.9,
        maxTokens: 160,
      });
      titles = result.text.split("\n").map((item) => item.replace(/^\d+[\.)]\s*/, "").trim()).filter((item) => item.length > 10).slice(0, 5);
      if (titles.length < 3) {
        titles = createSeoTitles({ name, keywords });
      } else {
        model = result.model;
        tokensUsed = result.tokensUsed;
      }
    } catch {
      titles = createSeoTitles({ name, keywords });
    }

    return NextResponse.json({ ok: true, titles, tokensUsed, model });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Không thể tạo tên sản phẩm." }, { status: 500 });
  }
}
