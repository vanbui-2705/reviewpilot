"use server";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "qwen3:8b";

export interface AIRequest {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  text: string;
  model: string;
  tokensUsed?: number;
}

async function ensureOllamaRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function isOllamaAvailable(): Promise<boolean> {
  return ensureOllamaRunning();
}

export async function getOllamaModels(): Promise<string[]> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  } catch {
    return [];
  }
}

async function callOllama(req: AIRequest): Promise<AIResponse> {
  const available = await ensureOllamaRunning();
  if (!available) {
    throw new Error(
      "Ollama chưa chạy. Chạy lệnh sau rồi thử lại:\n" +
      "  1. ollama pull qwen3:8b\n" +
      "  2. ollama serve\n" +
      "Hoặc dùng script: npm run ollama:setup"
    );
  }

  const models = await getOllamaModels();
  const modelToUse = models.includes(DEFAULT_MODEL)
    ? DEFAULT_MODEL
    : models[0] || DEFAULT_MODEL;

  try {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          {
            role: "system",
            content: req.system || "You are a helpful assistant for Shopee sellers. Reply in Vietnamese.",
          },
          {
            role: "user",
            content: req.prompt,
          },
        ],
        stream: false,
        think: false,
        options: {
          temperature: req.temperature ?? 0.7,
          num_predict: req.maxTokens ?? 512,
          num_ctx: 2048,
        },
      }),
      signal: AbortSignal.timeout(Math.max(90000, (req.maxTokens ?? 512) * 900)),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "Unknown error");
      throw new Error(`Ollama HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    return {
      text: (data.message?.content || data.response || "").trim(),
      model: data.model || modelToUse,
      tokensUsed: data.eval_count,
    };
  } catch (err: any) {
    if (err.message?.includes("ECONNREFUSED") || err.message?.includes("fetch failed")) {
      throw new Error(
        "Không kết nối Ollama. Chạy: ollama serve\n" +
        "Pull model nếu chưa có: ollama pull qwen3:8b"
      );
    }
    throw err;
  }
}

export async function generateText(req: AIRequest): Promise<AIResponse> {
  return callOllama(req);
}

export async function generateJSON<T>(req: AIRequest, fallback: T): Promise<T> {
  const result = await callOllama({
    ...req,
    system: `${req.system || "You are a helpful assistant."}\n\nCRITICAL: Output ONLY raw JSON. No markdown. No explanation. No code fences.`,
    prompt: `${req.prompt}\n\nRemember: JSON only.`,
  });

  try {
    const cleaned = result.text
      .replace(/```(?:json)?/g, "")
      .replace(/^[^{\[]+/, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}
