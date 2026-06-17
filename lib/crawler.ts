export function extractBetween(html: string, start: string, end: string): string | null {
  const idx = html.indexOf(start);
  if (idx === -1) return null;
  const contentStart = idx + start.length;
  const endIdx = html.indexOf(end, contentStart);
  if (endIdx === -1) return null;
  return html.slice(contentStart, endIdx).trim();
}

export function unescapeJsonString(s: string): string {
  return s
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");
}

export function extractShopeeData(html: string, url: string) {
  const title = (() => {
    const ogTitle = extractBetween(html, '<meta property="og:title" content="', '"');
    if (ogTitle) return unescapeJsonString(ogTitle);
    const titleTag = extractBetween(html, "<title>", "</title>");
    return titleTag ? titleTag.replace(/\s*-\s*Shopee.*$/, "").trim() : "Sản phẩm Shopee";
  })();

  const image = (() => {
    const ogImg = extractBetween(html, '<meta property="og:image" content="', '"');
    if (ogImg) return unescapeJsonString(ogImg);
    const match = html.match(/https?:\/\/[^"'\s]+\.(jpg|jpeg|png|webp)/);
    return match ? match[0] : "";
  })();

  let price: string | null = null;
  let shop = "Shopee Shop";
  let rating = "";
  let sold = "";

  const initialStateMatch = html.match(/<script type="application\/json"\s*id="__NEXT_DATA__">([\s\S]*?)<\/script>/);
  if (initialStateMatch) {
    try {
      const stateStr = unescapeJsonString(initialStateMatch[1]);
      const state = JSON.parse(stateStr);
      const productInfo = state?.props?.pageProps?.productInfo
        ?? state?.props?.pageProps?.data?.productInfo
        ?? state?.props?.pageProps?.item;

      if (productInfo) {
        if (productInfo.name) shop = productInfo.name;
        if (productInfo.shop?.name) shop = productInfo.shop.name;
        if (productInfo.rating) rating = String(productInfo.rating);
        if (productInfo.sold) sold = String(productInfo.sold);
        if (productInfo.price) {
          const p = typeof productInfo.price === "object" ? productInfo.price[0] : productInfo.price;
          price = p ? `${Number(p).toLocaleString("vi-VN")}đ` : null;
        }
      }
    } catch { /* fallback to regex */ }
  }

  if (!price) {
    const pricePatterns = [
      /"price"\s*:\s*(\d{5,})/,
      /"final_price"\s*:\s*(\d{5,})/,
      /"original_price"\s*:\s*(\d{5,})/,
      /data-price="(\d{5,})"/,
      /(\d{2,3}[\d\s]*000)\s*đ/,
    ];
    for (const pat of pricePatterns) {
      const m = html.match(pat);
      if (m) {
        price = `${Number(m[1]).toLocaleString("vi-VN")}đ`;
        break;
      }
    }
  }

  if (!rating) {
    const rm = html.match(/"rating_star"\s*:\s*([\d.]+)/);
    if (rm) rating = rm[1];
  }

  if (!sold) {
    const sm = html.match(/"historical_sold"\s*:\s*(\d+)/);
    if (sm) sold = Number(sm[1]).toLocaleString("vi-VN");
  }

  if (!shop) {
    const shopMatch = html.match(/"shop_name"\s*:\s*"([^"]+)"/);
    if (shopMatch) shop = shopMatch[1];
  }

  return {
    url,
    title,
    price: price || "Liên hệ",
    shop,
    rating: rating || "—",
    sold: sold || "—",
    image,
    crawledAt: new Date().toISOString(),
  };
}

export async function crawlShopeeProduct(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
      },
      redirect: "follow",
      next: { revalidate: 3600 } // Cache 1 giờ (ISR)
    });
    
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    
    const html = await res.text();
    if (!html.includes("shopee") && !html.includes("Shopee")) {
      return { ok: false, error: "Trang không hợp lệ" };
    }
    
    return { ok: true, ...extractShopeeData(html, url) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi crawl" };
  }
}
