#!/usr/bin/env node
/**
 * Ollama Setup Script
 * - Check if Ollama is installed
 * - Pull qwen3:8b model
 * - Start ollama serve
 * - Verify connection
 */

const { spawn } = require("child_process");
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL || "qwen3:8b";

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: "pipe", shell: true, ...opts });
    let stdout = "", stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("close", (code) => (code === 0 ? resolve(stdout) : reject(new Error(stderr || `Exit ${code}`))));
  });
}

function fetchJSON(url, opts = {}) {
  return fetch(url, { ...opts, signal: AbortSignal.timeout(10000) }).then((r) => r.json());
}

async function checkOllamaInstalled() {
  console.log("🔍 Checking Ollama installation...");
  try {
    await run("ollama", ["--version"]);
    console.log("  ✅ Ollama installed\n");
    return true;
  } catch {
    console.log("  ❌ Ollama not found\n");
    return false;
  }
}

async function checkOllamaRunning() {
  try {
    const data = await fetchJSON(`${OLLAMA_URL}/api/tags`);
    return data.models || [];
  } catch {
    return null;
  }
}

async function startOllama() {
  console.log("🚀 Starting ollama serve...");
  const proc = spawn("ollama", ["serve"], { shell: true, stdio: "pipe" });
  proc.stdout.on("data", (d) => console.log("  [ollama]", d.toString().trim()));
  proc.stderr.on("data", (d) => console.error("  [ollama]", d.toString().trim()));

  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const models = await checkOllamaRunning();
    if (models !== null) {
      console.log("  ✅ Ollama is running\n");
      return { proc, models };
    }
  }
  throw new Error("Ollama did not start in time");
}

async function pullModel(proc) {
  console.log(`📦 Pulling model: ${MODEL} (this may take a few minutes on first run)...`);
  try {
    await run("ollama", ["pull", MODEL], { timeout: 600000 });
    console.log(`  ✅ Model ${MODEL} ready\n`);
  } catch (err) {
    console.log(`  ⚠️  Could not pull ${MODEL}: ${err.message}`);
    console.log("  Trying to use whatever model is available...\n");
  }
}

async function verifyConnection() {
  console.log("🔗 Verifying Ollama connection...");
  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt: "Hi", stream: false }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log("  ✅ Connection verified\n");
    return true;
  } catch (err) {
    console.log(`  ❌ Connection failed: ${err.message}\n`);
    return false;
  }
}

async function main() {
  console.log("=".repeat(50));
  console.log("  Ollama + Qwen3 Setup for ReviewPilot");
  console.log("=".repeat(50) + "\n");

  const installed = await checkOllamaInstalled();
  if (!installed) {
    console.log("📥 Install Ollama:");
    console.log("   https://ollama.com/download");
    console.log("\n   Or via winget: winget install Ollama.Ollama");
    console.log("\n   Then re-run this script.\n");
    process.exit(1);
  }

  const existingModels = await checkOllamaRunning();
  let proc = null;

  if (existingModels === null) {
    const { proc: p } = await startOllama();
    proc = p;
  } else {
    console.log(`✅ Ollama already running (${existingModels.length} models)`);
    if (existingModels.length > 0) {
      console.log(`   Available: ${existingModels.map((m: { name: string }) => m.name).join(", ")}`);
    }
    console.log();
  }

  const hasModel = existingModels?.some((m: { name: string }) => m.name.startsWith(MODEL.replace(":latest", "")));
  if (!hasModel) {
    await pullModel(proc);
  } else {
    console.log(`✅ Model ${MODEL} already available\n`);
  }

  const ok = await verifyConnection();
  if (!ok) {
    console.log("💡 Troubleshooting:");
    console.log("   1. Make sure Ollama is running: ollama serve");
    console.log(`   2. Pull the model: ollama pull ${MODEL}`);
    console.log("   3. Check firewall allows port 11434");
  }

  if (proc) {
    console.log("\n⚠️  Ollama is running in background (PID: " + proc.pid + ")");
    console.log("   Press Ctrl+C to stop\n");
    process.on("SIGINT", () => { proc.kill(); process.exit(0); });
    await new Promise(() => {}); // keep alive
  }

  console.log("✨ Setup complete!");
}

main().catch((err) => {
  console.error("❌ Setup failed:", err.message);
  process.exit(1);
});
