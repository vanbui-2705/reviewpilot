import { chromium } from "playwright-core";

async function main() {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] });
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
  });

  await page.goto("https://shopee.vn/search?keyword=iphone", { waitUntil: "networkidle", timeout: 25000 });
  await page.waitForTimeout(3000);

  console.log("TITLE:", await page.title());
  console.log("URL:", page.url);

  const sqeCount = await page.evaluate(() => document.querySelectorAll('[data-sqe="item"]').length);
  console.log("[data-sqe=item]:", sqeCount);

  const linkCount = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a[href]"))
      .map(a => (a as HTMLAnchorElement).href)
      .filter(h => h.includes("/product/"))
      .slice(0, 5);
  });
  console.log("product links:", linkCount);

  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log("BODY:", bodyText);

  await page.screenshot({ path: "E:/Tools/pipeline-kim-tien/reviewpilot-app/debug-shopee.png" });
  console.log("screenshot saved");

  await browser.close();
}

main().catch(e => console.error("ERR:", e.message));
