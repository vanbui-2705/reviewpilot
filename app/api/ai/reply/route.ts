import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai/ollama";
import { createReviewReply, isWeakGeneratedText } from "@/lib/ai/local-tools";

const schema = z.object({
  review: z.string().min(5).max(2000),
  rating: z.coerce.number().min(1).max(5).optional(),
  shopName: z.string().optional(),
});

const SYSTEM_PROMPT = `Bạn là trợ lý viết phản hồi khách hàng cho chủ shop Shopee.
Trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp, ngắn gọn tối đa 3-4 câu.
Nếu khách không hài lòng, xin lỗi chân thành, đề nghị gửi mã đơn hàng để kiểm tra và đưa ra hướng hỗ trợ.`;

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

    const { review, rating, shopName } = parsed.data;
    const prompt = `Khach hang ${shopName ? `cua shop "${shopName}"` : ""} danh gia ${rating ?? "?"} sao:
"${review}"

Viết 1 phản hồi chuyên nghiệp bằng tiếng Việt.`;

    let result: { text: string; model: string; tokensUsed?: number };
    try {
      if (!USE_OLLAMA) throw new Error("Use local AI fallback");
      result = await generateText({
        prompt,
        system: SYSTEM_PROMPT,
        temperature: 0.8,
        maxTokens: 120,
      });
      if (isWeakGeneratedText(result.text)) {
        result = {
          text: createReviewReply({ review, rating, shopName }),
          model: "local-fallback",
        };
      }
    } catch {
      result = {
        text: createReviewReply({ review, rating, shopName }),
        model: "local-fallback",
      };
    }

    return NextResponse.json({
      ok: true,
      suggestion: result.text,
      tokensUsed: result.tokensUsed,
      model: result.model,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Không thể tạo phản hồi." },
      { status: 500 }
    );
  }
}
