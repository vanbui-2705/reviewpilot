import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai/ollama";
import { analyzeSentiment } from "@/lib/ai/local-tools";

const schema = z.object({
  reviews: z.array(z.string().min(5)).min(1).max(20),
  productName: z.string().optional(),
});

const SYSTEM_PROMPT = `Bạn là chuyên gia phân tích cảm xúc review Shopee.
Trả về JSON raw duy nhất: { summary, sentiment, score, highlights, suggestions }.`;

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

    const { reviews, productName } = parsed.data;
    const local = analyzeSentiment({ reviews, productName });
    const reviewText = reviews.map((item, index) => `[${index + 1}] ${item}`).join("\n");

    let analysis = local;
    let model = "local-fallback";
    let tokensUsed: number | undefined;
    try {
      if (!USE_OLLAMA) throw new Error("Use local AI fallback");
      const result = await generateText({
        prompt: `Phân tích ${reviews.length} review cho "${productName || "sản phẩm"}":\n${reviewText}\nTrả về JSON raw.`,
        system: SYSTEM_PROMPT,
        temperature: 0.3,
        maxTokens: 300,
      });
      const cleaned = result.text.replace(/```json|```/g, "").trim();
      analysis = JSON.parse(cleaned);
      model = result.model;
      tokensUsed = result.tokensUsed;
    } catch {
      analysis = local;
    }

    return NextResponse.json({
      ok: true,
      analysis,
      reviewCount: reviews.length,
      tokensUsed,
      model,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Không thể phân tích cảm xúc." },
      { status: 500 }
    );
  }
}
