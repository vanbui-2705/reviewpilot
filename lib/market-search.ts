import type { Marketplace, Product, ProductOffer } from "./data";

export type MarketSearchOffer = {
  id: string;
  query: string;
  marketplace: Marketplace;
  shopName: string;
  title: string;
  image: string;
  price: number;
  oldPrice: number;
  rating: number;
  sold: number;
  condition: string;
  affiliateUrl: string;
  source: "shopee-api" | "playwright";
};

const SHOPEE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  Referer: "https://shopee.vn/",
};

async function shopeeSearchAPI(keyword: string): Promise<MarketSearchOffer[]> {
  const url = `https://shopee.vn/api/v4/search/search_items?keyword=${encodeURIComponent(keyword)}&limit=20&sort_by=sales`;

  const res = await fetch(url, {
    headers: SHOPEE_HEADERS,
    redirect: "follow",
    next: { revalidate: 600 },
  });

  if (!res.ok) throw new Error(`Shopee search API HTTP ${res.status}`);

  const data = await res.json();
  const items = data?.items || [];

  return items
    .filter((raw: any) => raw && raw.item_basic)
    .map((raw: any, index: number) => {
      const item = raw.item_basic;
      const price = Math.round((item.price || item.price_min || 0) / 100000);
      const originalPrice = Math.round((item.price_before_discount || item.price_max || 0) / 100000);
      const shopName = item.shop_name || item.shop_location || `Shop ${index + 1}`;
      const image = item.image?.startsWith?.("http") ? item.image : item.image ? `https://cf.shopee.vn/file/${item.image}` : "";
      const productUrl = `https://shopee.vn/product/${item.shopid}/${item.itemid}`;

      return {
        id: `shopee-${item.itemid}-${index}`,
        query: keyword,
        marketplace: "Shopee" as Marketplace,
        shopName,
        title: item.name || `${keyword} - sản phẩm ${index + 1}`,
        image,
        price: price || 0,
        oldPrice: originalPrice || Math.round((price || 0) * 1.1 / 1000) * 1000,
        rating: item.item_rating?.rating_star || 0,
        sold: item.historical_sold || item.sold || 0,
        condition: "Mới",
        affiliateUrl: productUrl,
        source: "shopee-api" as const,
      };
    })
    .filter((item: MarketSearchOffer) => item.price > 0);
}

export function searchMarketplaceOffers(query: string): MarketSearchOffer[] {
  return [];
}

export async function searchMarketplaceOffersAsync(query: string): Promise<MarketSearchOffer[]> {
  try {
    const results = await shopeeSearchAPI(query);
    if (results.length > 0) return results;
  } catch {
    // fall through to playwright
  }

  try {
    const results = await searchViaPlaywright(query);
    if (results.length > 0) return results;
  } catch {
    // no real data available
  }

  return [];
}

async function searchViaPlaywright(query: string): Promise<MarketSearchOffer[]> {
  const runtimeRequire = eval("require") as NodeRequire;
  const { chromium } = runtimeRequire("playwright-core");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.setExtraHTTPHeaders({
    "User-Agent": SHOPEE_HEADERS["User-Agent"],
    "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.5",
  });

  try {
    const searchUrl = `https://shopee.vn/search?keyword=${encodeURIComponent(query)}&page=0`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 25000 });

    await page.waitForSelector('[data-sqe="item"]', { timeout: 12000 }).catch(() => {});

    await page.evaluate(async () => {
      for (let i = 0; i < 4; i++) {
        window.scrollBy(0, window.innerHeight);
        await new Promise((r) => setTimeout(r, 500));
      }
    });

    const items = await page.evaluate(() => {
      const results: any[] = [];
      document.querySelectorAll('[data-sqe="item"]').forEach((el: any) => {
        const link = el.querySelector("a");
        if (!link) return;
        const href = link.getAttribute("href") || "";
        const match = href.match(/-i\.(\d+)\.(\d+)/);

        const nameEl = el.querySelector('div[class*="whitespace-normal"]') || el.querySelector('[data-sqe="name"]');
        const name = nameEl?.textContent?.trim() || "";

        const img = el.querySelector("img");
        const imgSrc = img?.getAttribute("src") || img?.getAttribute("data-src") || "";

        const priceDivs = Array.from(el.querySelectorAll("div")).filter(
          (d: any) => d.textContent?.includes("₱") || d.textContent?.includes("đ")
        );
        let price = 0;
        for (const d of priceDivs) {
          const text: string = (d as any).textContent || "";
          const m = text.match(/[\d.,]+/);
          if (m) {
            const n = parseInt(m[0].replace(/[^\d]/g, ""), 10);
            if (n > price) price = n;
          }
        }

        const soldRaw = Array.from(el.querySelectorAll("div")).find(
          (d: any) => (d as any).textContent?.includes("Đ\xE3 b\xE1n")
        );
        let sold = 0;
        if (soldRaw) {
          const txt: string = (soldRaw as any).textContent!.replace("Đã bán", "").trim();
          sold = txt.includes("k")
            ? parseFloat(txt.replace("k", "").replace(",", ".")) * 1000
            : parseInt(txt.replace(/[^\d]/g, ""), 10) || 0;
        }

        const ratingEl = el.querySelector('[data-sqe="rating"]');
        const ratingText = ratingEl?.textContent?.trim();
        const rating = ratingText ? parseFloat(ratingText) : 0;

        if (name && price > 0) {
          results.push({
            id: `pw-${match?.[1]}-${match?.[2]}-${results.length}`,
            query: "",
            marketplace: "Shopee" as Marketplace,
            shopName: "Shopee Shop",
            title: name,
            image: imgSrc,
            price,
            oldPrice: Math.round(price * 1.1 / 1000) * 1000,
            rating,
            sold,
            condition: "Mới",
            affiliateUrl: href.startsWith("http") ? href : `https://shopee.vn${href}`,
            source: "playwright",
          });
        }
      });
      return results;
    });

    return items;
  } finally {
    await page.close();
    await browser.close();
  }
}

export function summarizeComparison(query: string) {
  return {
    ok: true,
    query,
    mode: "real-data",
    totalOffers: 0,
    offers: [],
    crawledAt: new Date().toISOString(),
    note: "Chờ crawl dữ liệu thật từ Shopee.",
  };
}
