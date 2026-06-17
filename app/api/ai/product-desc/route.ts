import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai/ollama";
import { createProductDescription, isWeakGeneratedText } from "@/lib/ai/local-tools";

const schema = z.object({
  name: z.string().min(2).max(200),
  features: z.string().optional(),
  category: z.string().optional(),
});

const SYSTEM_PROMPT = `Bạn là chuyên gia viết mô tả sản phẩm Shopee.
Viết bằng tiếng Việt, có lợi ích mở đầu, bullet tính năng, CTA cuối bài, tối đa 150 từ.`;

const USE_OLLAMA = process.env.AI_USE_OLLAMA === "true";

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
        { status: 400 }
      );
    }

    const { name, features, category } = parsed.data;
    const prompt = `Viết mô tả sản phẩm Shopee:
- Tên: ${name}
- Danh mục: ${category || "chung"}
- Tính năng: ${features || "không có thông tin thêm"}

Trả về một mô tả duy nhất, không giải thích.`;

    let result: { text: string; model: string; tokensUsed?: number };
    try {
      if (!USE_OLLAMA) throw new Error("Use local AI fallback");
      result = await generateText({
        prompt,
        system: SYSTEM_PROMPT,
        temperature: 0.9,
        maxTokens: 220,
      });
      if (isWeakGeneratedText(result.text)) {
        result = {
          text: createProductDescription({ name, features, category }),
          model: "local-fallback",
        };
      }
    } catch {
      result = {
        text: createProductDescription({ name, features, category }),
        model: "local-fallback",
      };
    }

    return NextResponse.json({
      ok: true,
      description: result.text,
      tokensUsed: result.tokensUsed,
      model: result.model,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Không thể tạo mô tả." },
      { status: 500 }
    );
  }
}
