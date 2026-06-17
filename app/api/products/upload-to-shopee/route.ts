import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { productId, name } = await request.json();

    const shopeeUrl = process.env.SHOPEE_SELLER_URL || "https://seller.shopee.vn/edu/article/22512";
    const sellerEmail = process.env.SHOPEE_SELLER_EMAIL || "";
    const sellerPassword = process.env.SHOPEE_SELLER_PASSWORD || "";

    if (!sellerEmail || !sellerPassword) {
      return NextResponse.json(
        { ok: false, error: "Chưa cấu hình Shopee Seller credentials. Set SHOPEE_SELLER_EMAIL và SHOPEE_SELLER_PASSWORD trong .env" },
        { status: 400 }
      );
    }

    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1366, height: 768 });

    try {
      await page.goto("https://seller.shopee.vn/edu/article/22512", {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await page.goto("https://seller.shopee.vn/login", {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await page.fill('input[type="text"], input[placeholder*="email"], input[placeholder*="số điện thoại"]', sellerEmail);
      await page.fill('input[type="password"]', sellerPassword);

      await Promise.all([
        page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {}),
        page.click('button[type="submit"], button:has-text("Đăng nhập"), button:has-text("Login")').catch(() => {}),
      ]);

      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      if (currentUrl.includes("login") || currentUrl.includes("otp") || currentUrl.includes("verify")) {
        return NextResponse.json({
          ok: false,
          error: "Cần xác thực OTP/2FA. Vui lòng đăng nhập thủ công trên Seller Center trước.",
          loginUrl: "https://seller.shopee.vn/login",
        });
      }

      await page.goto("https://seller.shopee.vn/product/add", {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await page.waitForTimeout(2000);
      await page.fill('input[name="name"], input[placeholder*="tên sản phẩm"]', name || "Sản phẩm mới");

      await page.screenshot({ path: "product-upload.png" });

      return NextResponse.json({
        ok: true,
        message: "Đã điền tên sản phẩm. Cần bổ sung thông tin còn lại và bấm Đăng.",
        screenshot: "/product-upload.png",
        loginUrl: currentUrl,
      });
    } finally {
      await page.close();
      await browser.close();
    }
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Upload thất bại" },
      { status: 500 }
    );
  }
}

async function getBrowser() {
  const runtimeRequire = eval("require") as NodeRequire;
  const { chromium } = runtimeRequire("playwright-core");
  return chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
}
