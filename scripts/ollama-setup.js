#!/usr/bin/env node
/**
 * Ollama + Qwen3 setup script
 * Chạy: node scripts/ollama-setup.js
 * Hoặc: npm run ollama:setup
 */

const { execSync, spawn } = require("child_process");
const http = require("http");

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL || "qwen3:8b";

function checkOllamaRunning() {
  return new Promise((resolve) => {
    const req = http.get(`${OLLAMA_URL}/api/tags`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(3000, () => { req.destroy(); resolve(false); });
  });
}

function run(cmd, label) {
  console.log(`\n[setup] ${label}...`);
  try {
    const out = execSync(cmd, { encoding: "utf8", stdio: "pipe", timeout: 120000 });
    console.log(out.trim().slice(0, 500));
  } catch (e: any) {
    console.log(`  ⚠ ${e.message?.slice(0, 200)}`);
  }
}

async function main() {
  console.log("=== ReviewPilot AI Setup (Ollama + Qwen3) ===\n");

  // Step 1: Check Ollama binary
  console.log("[1/4] Kiểm tra Ollama binary...");
  let ollamaPath: string;
  try {
    ollamaPath = execSync("where ollama", { encoding: "utf8" }).trim();
    console.log(`  ✓ Ollama: ${ollamaPath}`);
  } catch {
    console.log("  ✗ Ollama chưa cài. Tự động cài...");
    run("winget install Ollama.Ollama -e --accept-package-agreements --accept-source-agreements", "cài Ollama qua winget");
    try {
      ollamaPath = execSync("where ollama", { encoding: "utf8" }).trim();
      console.log(`  ✓ Ollama đã cài: ${ollamaPath}`);
    } catch {
      console.log("\n❌ Cài Ollama thất bại. Cài thủ công: https://ollama.com/download\n");
      process.exit(1);
    }
  }

  // Step 2: Start Ollama service
  console.log("\n[2/4] Khởi động Ollama service...");
  const running = await checkOllamaRunning();
  if (running) {
    console.log("  ✓ Ollama đã chạy tại " + OLLAMA_URL);
  } else {
    console.log("  → Đang khởi động ollama serve...");
    const child = spawn("ollama", ["serve"], { detached: true, stdio: "ignore" });
    child.unref();
    await new Promise((r) => setTimeout(r, 4000));
    const after = await checkOllamaRunning();
    if (after) {
      console.log("  ✓ Ollama đã khởi động");
    } else {
      console.log("  ⚠ Không tự khởi động được. Chạy thủ công: ollama serve\n");
    }
  }

  // Step 3: Pull Qwen3
  console.log(`\n[3/4] Pull model ${MODEL}...`);
  const models = await (async () => {
    try {
      const res = await new Promise<{ ok: boolean }>((resolve) => {
        http.get(`${OLLAMA_URL}/api/tags`, (r) => resolve({ ok: true, ok: r.statusCode === 200 } as any));
      });
      if (!res.ok) return [];
      const buf = await new Promise<any>((resolve) => {
        http.get(`${OLLAMA_URL}/api/tags`, (r) => {
          const chunks: Buffer[] = [];
          r.on("data", (c) => chunks.push(c));
          r.on("end", () => resolve(JSON.parse(Buffer.concat(chunks).toString())));
        });
      });
      return buf.models?.map((m: { name: string }) => m.name) || [];
    } catch {
      return [];
    }
  })();

  if (models.includes(MODEL)) {
    console.log(`  ✓ Model ${MODEL} đã có sẵn`);
  } else {
    console.log(`  → Pull ${MODEL} (lần đầu ~4.7GB, mất vài phút)...`);
    run(`ollama pull ${MODEL}`, `pull ${MODEL}`);
  }

  // Step 4: Verify
  console.log("\n[4/4] Verify...");
  const finalRunning = await checkOllamaRunning();
  const finalModels = await getOllamaModels();
  console.log(`  Ollama running: ${finalRunning ? "✓" : "✗"}`);
  console.log(`  Models: ${finalModels.join(", ") || "(none)"}`);

  // Add npm scripts if not present
  console.log("\n=== Done! ===");
  console.log("\nChạy Ollama:    ollama serve");
  console.log("Pull model:     ollama pull qwen3:8b");
  console.log("Test API:       curl http://localhost:11434/api/generate -d '{...}'");
  console.log("\nSet env trong .env.local:");
  console.log("  OLLAMA_URL=http://localhost:11434");
  console.log("  OLLAMA_MODEL=qwen3:8b");
}

async function getOllamaModels(): Promise<string[]> {
  try {
    const buf = await new Promise<any>((resolve, reject) => {
      http.get(`${OLLAMA_URL}/api/tags`, (r) => {
        if (r.statusCode !== 200) return resolve([]);
        const chunks: Buffer[] = [];
        r.on("data", (c) => chunks.push(c));
        r.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch { resolve([]); } });
        r.on("error", reject);
      }).on("error", () => resolve([]));
    });
    return buf.models?.map((m: { name: string }) => m.name) || [];
  } catch {
    return [];
  }
}

main().catch((e) => { console.error("Fatal:", e.message); process.exit(1); });
