import { chromium } from "playwright-core";

async function main() {
  const urls = [
    "https://shopee.vn/search?keyword=iphone",
    "https://shopee.vn/api/v2/search_items/?keyword=iphone&limit=5",
  ];

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  for (const url of urls) {
    const page = await browser.newPage();
    try {
      await page.setViewportSize({ width: 1366, height: 768 });
      await page.setExtraHTTPHeaders({
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.5",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36",
      });

      if (url.includes("/api/")) {
        const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
        const text = await page.evaluate(() => document.body.innerText.slice(0, 500));
        console.log(`\n[API] ${url}`);
        console.log(`status: ${res?.status()}`);
        console.log(text);
      } else {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForTimeout(3000);
        const title = await page.title();
        const itemCount = await page.evaluate(() => document.querySelectorAll('[data-sqe="item"]').length);
        const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 300));
        console.log(`\n[PAGE] ${url}`);
        console.log(`title: ${title}`);
        console.log(`[data-sqe="item"]: ${itemCount}`);
        console.log(bodyText);
      }
    } catch (err: any) {
      console.log(`\n[ERR] ${url}: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
}

main();
