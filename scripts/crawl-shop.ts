import { chromium } from "playwright-core";

async function main() {
  const shopUrl = process.argv[2];
  if (!shopUrl) {
    console.error("Usage: tsx scripts/crawl-shop.ts <shopUrl>");
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();

  try {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.setExtraHTTPHeaders({ "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.5" });
    await page.goto(shopUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
    await page.waitForSelector('[data-sqe="item"]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const items = await page.evaluate(() => {
      const items: any[] = [];
      document.querySelectorAll('[data-sqe="item"]').forEach((el) => {
        const link = el.querySelector("a") as HTMLAnchorElement | undefined;
        const name = el.querySelector('[data-sqe="name"]')?.textContent?.trim() ?? "";
        const img = el.querySelector("img");
        const image = img?.getAttribute("src") || img?.getAttribute("data-src") || "";
        const priceEl = el.querySelector(".shopee-price__current-price");
        const priceStr = priceEl?.textContent?.replace(/[^\d]/g, "") ?? "0";
        const price = parseInt(priceStr, 10);
        const ratingStr = el.querySelector('[data-sqe="rating"]')?.textContent?.trim() ?? "0";
        const rating = parseFloat(ratingStr);
        const soldStr = el.querySelector('[data-sqe="sold"]')?.textContent?.replace(/[^\d]/g, "") ?? "0";
        const sold = parseInt(soldStr, 10);
        if (!link || !name) return;
        const href = link.getAttribute("href") || "";
        const m = href.match(/\/product\/(\d+)\/(\d+)/);
        const itemId = m?.[2] ?? href;
        items.push({
          itemId,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60),
          image,
          imageThumb: image,
          priceMin: price,
          priceMax: price,
          originalPrice: price,
          stock: 0,
          sold,
          rating: isNaN(rating) ? 0 : rating,
          ratingCount: 0,
          likes: 0,
          status: "active",
          attributes: [],
          categories: [],
          url: href.startsWith("http") ? href : `https://shopee.vn${href}`,
          shopeeUrl: href.startsWith("http") ? href : `https://shopee.vn${href}`,
        });
      });
      return items;
    });

    console.log(JSON.stringify({ success: true, items, count: items.length }));
  } catch (err: any) {
    console.log(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
  } finally {
    await page.close();
    await browser.close();
  }
}

main();
