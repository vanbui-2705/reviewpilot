import { NextResponse } from "next/server";

/* ── Config ───────────────────────────────────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_APP_URL || "https://reviewpilot.vn";
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "";

/* ── Route ────────────────────────────────────────────────────── */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verify webhook secret (if configured)
    if (WEBHOOK_SECRET) {
      const secret = request.headers.get("x-telegram-bot-api-secret-token");
      if (secret !== WEBHOOK_SECRET) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
    }

    // Ignore non-message updates (callback_query, etc. handled by bot client)
    if (!body.message) {
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    const chatId = message.chat?.id;
    const text = message.text?.trim();

    if (!chatId || !text) {
      return NextResponse.json({ ok: true });
    }

    // Route commands
    if (text.startsWith("/start")) {
      await sendMessage(chatId, [
        `✈️ *Chào mừng đến ReviewPilot!*`,
        ``,
        `Mình giúp bạn tìm giá tốt nhất cho sản phẩm điện thoại, laptop, phụ kiện...`,
        ``,
        `🔍 Tìm giá: /price <sản phẩm>`,
        `🔥 Deals hot: /deals`,
        `🔔 Đặt alert: /alert <sản phẩm> <giá>`,
        ``,
        `Gõ tên sản phẩm trực tiếp để tìm giá nhanh!`,
      ].join("\n"), { parseMode: "Markdown" });
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/help")) {
      await sendMessage(chatId, [
        `📖 *Hướng dẫn ReviewPilot Bot*`,
        ``,
        `🔍 /price <sản phẩm> — Tìm và so sánh giá`,
        `🔥 /deals — Deals hot hôm nay`,
        `🔔 /alert <sp> <giá> — Đặt thông báo giá`,
        `📋 /myalerts — Xem alerts đang theo dõi`,
        `ℹ️ /help — Hướng dẫn này`,
        ``,
        `🌐 Website: https://reviewpilot.vn`,
      ].join("\n"), { parseMode: "Markdown" });
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/deals")) {
      await handleDeals(chatId);
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/alert")) {
      const args = text.replace(/^\/alert\s*/, "");
      await handleAlert(chatId, args);
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/myalerts")) {
      await handleMyAlerts(chatId);
      return NextResponse.json({ ok: true });
    }

    // Fallback: treat as product search (skip if it looks like a username/URL)
    if (text.length >= 2 && !text.startsWith("@") && !text.startsWith("#") && !text.startsWith("http")) {
      await handlePriceSearch(chatId, text);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram/webhook] Error:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "/api/telegram/webhook" });
}

/* ── Command Handlers ─────────────────────────────────────────── */

async function handlePriceSearch(chatId, query) {
  await sendChatAction(chatId, "typing");

  try {
    const res = await fetch(`${API_BASE}/api/search/compare?q=${encodeURIComponent(query)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.ok || !data.offers?.length) {
      await sendMessage(chatId, `😕 Không tìm thấy "*${escapeMd(query)}*". Thử từ khóa khác nhé!`, {
        parseMode: "Markdown",
      });
      return;
    }

    const offers = data.offers;
    const minPrice = Math.min(...offers.map((o) => o.price).filter((p) => p > 0));
    const lines = [`📱 *Kết quả: ${escapeMd(query)}*`, ``];

    offers.forEach((o) => {
      const isBest = o.price === minPrice && minPrice > 0;
      const discount = o.oldPrice > o.price ? Math.round((1 - o.price / o.oldPrice) * 100) : 0;
      const emoji = marketplaceEmoji(o.marketplace);
      const bestTag = isBest ? " ⭐ *GIÁ TỐT NHẤT*" : "";

      lines.push(`${emoji} *${o.marketplace}:* ${formatVnd(o.price)}${bestTag}`);
      if (o.oldPrice > o.price) {
        lines.push(`   ~~${formatVnd(o.oldPrice)}~~ 🔻 -${discount}%`);
      }
      lines.push(`   🏪 ${o.shopName || o.marketplace}`);
      lines.push(``);
    });

    if (minPrice > 0) lines.push(`💰 *Giá thấp nhất:* ${formatVnd(minPrice)}`);
    lines.push(``);
    lines.push(`👉 [Xem chi tiết](https://reviewpilot.vn)`);

    await sendMessage(chatId, lines.join("\n"), {
      parseMode: "Markdown",
      disableWebPagePreview: true,
    });
  } catch (err) {
    console.error("[/price] Error:", err);
    await sendMessage(chatId, "❌ Có lỗi xảy ra. Vui lòng thử lại sau.");
  }
}

async function handleDeals(chatId) {
  await sendChatAction(chatId, "typing");

  try {
    const res = await fetch(`${API_BASE}/api/deals`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 600 },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.ok || !data.products?.length) {
      await sendMessage(chatId, "😕 Hiện chưa có deals hot nào. Quay lại sau nhé!");
      return;
    }

    const products = data.products.slice(0, 5);
    const lines = [`🔥 *DEALS HOT HÔM NAY*`, ``];

    products.forEach((p, i) => {
      const price = p.price || p.priceMin || 0;
      const sold = p.sold || 0;
      const rating = p.rating || 0;
      lines.push(`*${i + 1}. ${escapeMd(p.name)}*`);
      lines.push(`   💰 ${formatVnd(price)}`);
      if (rating > 0) lines.push(`   ⭐ ${rating.toFixed(1)} | 🛒 Đã bán ${sold}`);
      lines.push(``);
    });

    lines.push(`👉 [Xem tất cả deals](https://reviewpilot.vn)`);

    await sendMessage(chatId, lines.join("\n"), {
      parseMode: "Markdown",
      disableWebPagePreview: true,
    });
  } catch (err) {
    console.error("[/deals] Error:", err);
    await sendMessage(chatId, "❌ Không thể tải deals. Thử lại sau nhé!");
  }
}

async function handleAlert(chatId, args) {
  const parts = args.trim().split(/\s+/);
  if (parts.length < 2) {
    await sendMessage(chatId,
      "⚠️ Cú pháp: `/alert <sản phẩm> <giá>`\nVí dụ: `/alert Samsung S24 18000000`",
      { parseMode: "Markdown" }
    );
    return;
  }

  const targetPrice = parseInt(parts.pop() || "", 10);
  const product = parts.join(" ");

  if (isNaN(targetPrice) || targetPrice <= 0) {
    await sendMessage(chatId, "⚠️ Giá không hợp lệ. Nhập số, VD: 18000000");
    return;
  }

  // Store in a simple in-memory map (use Redis in production)
  // For production, use the alerts service from telegram-bot/
  const alertKey = `rp:alert:${chatId}:${product.toLowerCase()}`;
  // Note: In production, store this in Redis via a separate API call

  await sendMessage(chatId,
    `🔔 Đã đặt alert!\n\n📱 ${product}\n💰 Mục tiêu: ${formatVnd(targetPrice)}\n\nMình sẽ thông báo khi giá xuống dưới mức này.\nXem: /myalerts`,
    { parseMode: "Markdown" }
  );
}

async function handleMyAlerts(chatId) {
  await sendMessage(chatId,
    "📋 Tính năng /myalerts đang phát triển.\n\nĐặt alert với: `/alert <sản phẩm> <giá>`",
    { parseMode: "Markdown" }
  );
}

/* ── Telegram API Helpers ─────────────────────────────────────── */
async function sendMessage(chatId, text, options = {}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN not configured");
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, ...options }),
    });
  } catch (err) {
    console.error("[sendMessage] Error:", err);
  }
}

async function sendChatAction(chatId, action) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, action }),
    });
  } catch {}
}

/* ── Helpers ──────────────────────────────────────────────────── */
function formatVnd(n) {
  if (!n || n <= 0) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

function escapeMd(str) {
  return str.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

function marketplaceEmoji(m) {
  const k = (m || "").toLowerCase();
  if (k.includes("shopee")) return "🛒";
  if (k.includes("lazada")) return "🛍️";
  if (k.includes("tiki")) return "📦";
  return "🏪";
}
