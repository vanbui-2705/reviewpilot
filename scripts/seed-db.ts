/**
 * ReviewPilot — Full database seed script
 *
 * Usage:
 *   cd reviewpilot-app && npx tsx scripts/seed-db.ts
 *   cd reviewpilot-app && npx tsx scripts/seed-db.ts --reset   # wipe first
 *
 * Seeds:
 *   Users → Products + Prices + PriceHistory → Shops → ShopeeProducts
 *   → ShopReviews → ShopMetrics → PlatformNews
 */

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

// ── CLI flags ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const RESET = args.includes("--reset");

// ── Helpers ──────────────────────────────────────────────────────────────────
const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[À-ỹ]/g, () => "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysAgo = (n: number) => {
  const d = today();
  d.setDate(d.getDate() - n);
  return d;
};

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number, decimals = 1) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Product data (reused from existing prisma/seed.ts) ───────────────────────
const PHONES = [
  {
    name: "iPhone 15 Pro Max 256GB", brand: "Apple", model: "iPhone 15 Pro Max",
    short: "Chip A17 Pro, titanium design, camera 48MP, màn hình Super Retina XDR 6.7 inch.",
    specs: { chip: "A17 Pro", screen: '6.7" Super Retina XDR 120Hz', camera: "48MP + 12MP + 12MP", battery: "4441 mAh", os: "iOS 18", storage: "256GB" },
    prices: [{ source: "Shopee", price: 33990000 }, { source: "Lazada", price: 34490000 }, { source: "Tiki", price: 34990000 }],
  },
  {
    name: "iPhone 15 Pro 128GB", brand: "Apple", model: "iPhone 15 Pro",
    short: "Chip A17 Pro, titanium, Dynamic Island.",
    specs: { chip: "A17 Pro", screen: '6.1" Super Retina XDR 120Hz', camera: "48MP + 12MP + 12MP", battery: "3274 mAh", os: "iOS 18", storage: "128GB" },
    prices: [{ source: "Shopee", price: 28990000 }, { source: "Lazada", price: 29490000 }, { source: "Tiki", price: 29990000 }],
  },
  {
    name: "iPhone 15 Plus 128GB", brand: "Apple", model: "iPhone 15 Plus",
    short: "Màn hình 6.7 inch, A16, Dynamic Island.",
    specs: { chip: "A16 Bionic", screen: '6.7" Super Retina XDR', camera: "48MP + 12MP", battery: "4383 mAh", os: "iOS 18", storage: "128GB" },
    prices: [{ source: "Shopee", price: 24490000 }, { source: "Lazada", price: 24990000 }],
  },
  {
    name: "iPhone 15 128GB", brand: "Apple", model: "iPhone 15",
    short: "A16 Bionic, Dynamic Island, USB-C.",
    specs: { chip: "A16 Bionic", screen: '6.1" Super Retina XDR', camera: "48MP + 12MP", battery: "3349 mAh", os: "iOS 18", storage: "128GB" },
    prices: [{ source: "Shopee", price: 21490000 }, { source: "Lazada", price: 21990000 }],
  },
  {
    name: "iPhone 14 Pro Max 256GB", brand: "Apple", model: "iPhone 14 Pro Max",
    short: "Dynamic Island, A16, ProRAW 48MP.",
    specs: { chip: "A16 Bionic", screen: '6.7" Super Retina XDR', camera: "48MP + 12MP + 12MP", battery: "4323 mAh", os: "iOS 18", storage: "256GB" },
    prices: [{ source: "Shopee", price: 27490000 }, { source: "Lazada", price: 27990000 }],
  },
  {
    name: "iPhone 14 Pro 128GB", brand: "Apple", model: "iPhone 14 Pro",
    short: "Dynamic Island, A16 Bionic.",
    specs: { chip: "A16 Bionic", screen: '6.1" Super Retina XDR', camera: "48MP + 12MP + 12MP", battery: "3200 mAh", os: "iOS 18", storage: "128GB" },
    prices: [{ source: "Shopee", price: 22990000 }, { source: "Lazada", price: 23490000 }],
  },
  {
    name: "iPhone 14 128GB", brand: "Apple", model: "iPhone 14",
    short: "A15 Bionic, Dual-camera 12MP.",
    specs: { chip: "A15 Bionic", screen: '6.1" Super Retina XDR OLED', camera: "12MP + 12MP", battery: "3279 mAh", os: "iOS 18", storage: "128GB" },
    prices: [{ source: "Shopee", price: 18990000 }, { source: "Lazada", price: 19490000 }],
  },
  {
    name: "iPhone 14 Plus 128GB", brand: "Apple", model: "iPhone 14 Plus",
    short: "Màn hình 6.7 inch, A15, pin bền.",
    specs: { chip: "A15 Bionic", screen: '6.7" Super Retina XDR', camera: "12MP + 12MP", battery: "4325 mAh", os: "iOS 18", storage: "128GB" },
    prices: [{ source: "Shopee", price: 19990000 }, { source: "Lazada", price: 20490000 }],
  },
  {
    name: "iPhone 13 128GB", brand: "Apple", model: "iPhone 13",
    short: "A15 Bionic, OLED 6.1 inch.",
    specs: { chip: "A15 Bionic", screen: '6.1" Super Retina XDR OLED', camera: "12MP + 12MP", battery: "3227 mAh", os: "iOS 18", storage: "128GB" },
    prices: [{ source: "Shopee", price: 15990000 }, { source: "Lazada", price: 16490000 }],
  },
  {
    name: "iPhone 13 Pro Max 256GB", brand: "Apple", model: "iPhone 13 Pro Max",
    short: "ProMotion 120Hz, A15, camera 12MP lớn.",
    specs: { chip: "A15 Bionic", screen: '6.7" Super Retina XDR 120Hz', camera: "12MP + 12MP + 12MP", battery: "4352 mAh", os: "iOS 18", storage: "256GB" },
    prices: [{ source: "Shopee", price: 23490000 }, { source: "Lazada", price: 23990000 }],
  },
  {
    name: "iPhone 12 64GB", brand: "Apple", model: "iPhone 12",
    short: "A14 Bionic, OLED, MagSafe, 5G.",
    specs: { chip: "A14 Bionic", screen: '6.1" Super Retina XDR OLED', camera: "12MP + 12MP", battery: "2815 mAh", os: "iOS 18", storage: "64GB" },
    prices: [{ source: "Shopee", price: 11990000 }, { source: "Lazada", price: 12490000 }],
  },
  {
    name: "iPhone 11 64GB", brand: "Apple", model: "iPhone 11",
    short: "A13 Bionic, Dual-camera 12MP.",
    specs: { chip: "A13 Bionic", screen: '6.1" Liquid Retina IPS LCD', camera: "12MP + 12MP", battery: "3110 mAh", os: "iOS 18", storage: "64GB" },
    prices: [{ source: "Shopee", price: 8990000 }, { source: "Lazada", price: 9290000 }],
  },
  {
    name: "Samsung Galaxy S24 Ultra 256GB", brand: "Samsung", model: "Galaxy S24 Ultra",
    short: "SD 8 Gen 3, S Pen, zoom 100x, AI.",
    specs: { chip: "Snapdragon 8 Gen 3", screen: '6.8" Dynamic AMOLED 2X 120Hz', camera: "200MP + 12MP + 50MP + 10MP", battery: "5000 mAh", os: "Android 14 / One UI 6", storage: "256GB" },
    prices: [{ source: "Shopee", price: 28990000 }, { source: "Lazada", price: 29490000 }],
  },
  {
    name: "Samsung Galaxy S24+ 256GB", brand: "Samsung", model: "Galaxy S24+",
    short: "SD 8 Gen 3, AI Galaxy, 6.7 inch QHD+.",
    specs: { chip: "Snapdragon 8 Gen 3", screen: '6.7" Dynamic AMOLED 2X QHD+', camera: "50MP + 12MP + 10MP", battery: "4900 mAh", os: "Android 14 / One UI 6", storage: "256GB" },
    prices: [{ source: "Shopee", price: 22990000 }, { source: "Lazada", price: 23490000 }],
  },
  {
    name: "Samsung Galaxy S24 128GB", brand: "Samsung", model: "Galaxy S24",
    short: "SD 8 Gen 3, AI Galaxy, camera 50MP.",
    specs: { chip: "Snapdragon 8 Gen 3", screen: '6.2" Dynamic AMOLED 2X FHD+', camera: "50MP + 12MP + 10MP", battery: "4000 mAh", os: "Android 14 / One UI 6", storage: "128GB" },
    prices: [{ source: "Shopee", price: 19490000 }, { source: "Lazada", price: 19990000 }],
  },
  {
    name: "Samsung Galaxy S23 Ultra 256GB", brand: "Samsung", model: "Galaxy S23 Ultra",
    short: "SD 8 Gen 2, S Pen, zoom 100x, camera 108MP.",
    specs: { chip: "Snapdragon 8 Gen 2", screen: '6.8" Dynamic AMOLED 2X 120Hz', camera: "108MP + 12MP + 10MP + 10MP", battery: "5000 mAh", os: "Android 14 / One UI 6", storage: "256GB" },
    prices: [{ source: "Shopee", price: 22990000 }, { source: "Lazada", price: 23490000 }],
  },
  {
    name: "Samsung Galaxy S23 128GB", brand: "Samsung", model: "Galaxy S23",
    short: "SD 8 Gen 2, camera 50MP, compact.",
    specs: { chip: "Snapdragon 8 Gen 2", screen: '6.1" Dynamic AMOLED 2X 120Hz', camera: "50MP + 12MP + 10MP", battery: "3900 mAh", os: "Android 14 / One UI 6", storage: "128GB" },
    prices: [{ source: "Shopee", price: 16490000 }, { source: "Lazada", price: 16990000 }],
  },
  {
    name: "Samsung Galaxy S22 Ultra 256GB", brand: "Samsung", model: "Galaxy S22 Ultra",
    short: "S Pen, SD 8 Gen 1, zoom 100x.",
    specs: { chip: "Snapdragon 8 Gen 1", screen: '6.8" Dynamic AMOLED 2X 120Hz', camera: "108MP + 12MP + 10MP + 10MP", battery: "5000 mAh", os: "Android 14 / One UI 6", storage: "256GB" },
    prices: [{ source: "Shopee", price: 19990000 }, { source: "Lazada", price: 20490000 }],
  },
  {
    name: "Samsung Galaxy A55 128GB", brand: "Samsung", model: "Galaxy A55",
    short: "Exynos 1480, AMOLED 120Hz, IP67.",
    specs: { chip: "Exynos 1480", screen: '6.5" Super AMOLED 120Hz', camera: "50MP + 12MP + 5MP", battery: "5000 mAh", os: "Android 14 / One UI 6.1", storage: "128GB" },
    prices: [{ source: "Shopee", price: 9490000 }, { source: "Lazada", price: 9790000 }, { source: "Tiki", price: 9690000 }],
  },
  {
    name: "Samsung Galaxy A54 128GB", brand: "Samsung", model: "Galaxy A54",
    short: "Exynos 1380, AMOLED 120Hz, IP67.",
    specs: { chip: "Exynos 1380", screen: '6.4" Super AMOLED 120Hz', camera: "50MP + 12MP + 5MP", battery: "5000 mAh", os: "Android 14 / One UI 6", storage: "128GB" },
    prices: [{ source: "Shopee", price: 7990000 }, { source: "Lazada", price: 8290000 }],
  },
  {
    name: "OPPO Reno11 Pro 256GB", brand: "Oppo", model: "Reno11 Pro",
    short: "Dimensity 8200, camera chân dung 32MP, sạc 80W.",
    specs: { chip: "Dimensity 8200", screen: '6.74" AMOLED 120Hz', camera: "50MP + 8MP + 32MP", battery: "4600 mAh", os: "ColorOS 14", storage: "256GB" },
    prices: [{ source: "Shopee", price: 13990000 }, { source: "Lazada", price: 14290000 }],
  },
  {
    name: "OPPO Reno11 128GB", brand: "Oppo", model: "Reno11",
    short: "Dimensity 7050, camera 32MP, sạc 67W.",
    specs: { chip: "Dimensity 7050", screen: '6.7" AMOLED 120Hz', camera: "64MP + 8MP + 32MP", battery: "4800 mAh", os: "ColorOS 14", storage: "128GB" },
    prices: [{ source: "Shopee", price: 9490000 }, { source: "Lazada", price: 9790000 }],
  },
  {
    name: "OPPO Find X7 Ultra 256GB", brand: "Oppo", model: "Find X7 Ultra",
    short: "SD 8 Gen 3, Hasselblad, zoom quang 10x.",
    specs: { chip: "Snapdragon 8 Gen 3", screen: '6.82" AMOLED 2K 120Hz', camera: "50MP Hasselblad + 50MP + 50MP + 50MP", battery: "5000 mAh", os: "ColorOS 14", storage: "256GB" },
    prices: [{ source: "Shopee", price: 23990000 }],
  },
  {
    name: "OPPO A78 128GB", brand: "Oppo", model: "A78",
    short: "SD 680, AMOLED 90Hz, giá tốt.",
    specs: { chip: "Snapdragon 680", screen: '6.67" AMOLED 90Hz', camera: "50MP + 2MP + 2MP", battery: "5000 mAh", os: "ColorOS 13.1", storage: "128GB" },
    prices: [{ source: "Shopee", price: 3990000 }, { source: "Lazada", price: 4190000 }],
  },
  {
    name: "Xiaomi 14 Pro 256GB", brand: "Xiaomi", model: "Xiaomi 14 Pro",
    short: "SD 8 Gen 3, Leica Summilux 50MP.",
    specs: { chip: "Snapdragon 8 Gen 3", screen: '6.73" AMOLED 2K 120Hz', camera: "50MP Leica + 50MP + 50MP", battery: "4880 mAh", os: "MIUI 15", storage: "256GB" },
    prices: [{ source: "Shopee", price: 23490000 }, { source: "Lazada", price: 23990000 }],
  },
  {
    name: "Xiaomi 14 256GB", brand: "Xiaomi", model: "Xiaomi 14",
    short: "SD 8 Gen 3, Leica, sạc 90W.",
    specs: { chip: "Snapdragon 8 Gen 3", screen: '6.36" AMOLED 120Hz', camera: "50MP Leica + 50MP + 50MP", battery: "4610 mAh", os: "MIUI 15", storage: "256GB" },
    prices: [{ source: "Shopee", price: 19990000 }, { source: "Lazada", price: 20490000 }],
  },
  {
    name: "Redmi Note 13 Pro+ 256GB", brand: "Xiaomi", model: "Redmi Note 13 Pro+",
    short: "Dimensity 7200 Ultra, 200MP, 120W.",
    specs: { chip: "Dimensity 7200 Ultra", screen: '6.67" AMOLED 1.5K 120Hz', camera: "200MP + 8MP + 2MP", battery: "5000 mAh", os: "MIUI 14", storage: "256GB" },
    prices: [{ source: "Shopee", price: 7990000 }, { source: "Lazada", price: 8290000 }],
  },
  {
    name: "Redmi Note 13 Pro 256GB", brand: "Xiaomi", model: "Redmi Note 13 Pro",
    short: "SD 7s Gen 2, 200MP, sạc 67W.",
    specs: { chip: "Snapdragon 7s Gen 2", screen: '6.67" AMOLED 1.5K 120Hz', camera: "200MP + 8MP + 2MP", battery: "5100 mAh", os: "MIUI 14", storage: "256GB" },
    prices: [{ source: "Shopee", price: 6790000 }, { source: "Lazada", price: 7090000 }],
  },
  {
    name: "Poco X6 Pro 256GB", brand: "Xiaomi", model: "Poco X6 Pro",
    short: "Dimensity 8300 Ultra, 1.5K 120Hz.",
    specs: { chip: "Dimensity 8300 Ultra", screen: '6.67" AMOLED 1.5K 120Hz', camera: "64MP + 8MP + 2MP", battery: "5000 mAh", os: "MIUI 14", storage: "256GB" },
    prices: [{ source: "Shopee", price: 7990000 }, { source: "Lazada", price: 8290000 }],
  },
  {
    name: "Realme 12 Pro+ 256GB", brand: "Realme", model: "Realme 12 Pro+",
    short: "SD 7s Gen 2, tele 64MP, sạc 67W.",
    specs: { chip: "Snapdragon 7s Gen 2", screen: '6.7" AMOLED 120Hz', camera: "50MP + 64MP tele + 8MP ultra", battery: "5000 mAh", os: "Realme UI 5", storage: "256GB" },
    prices: [{ source: "Shopee", price: 9490000 }, { source: "Lazada", price: 9790000 }],
  },
  {
    name: "Realme 11 Pro+ 256GB", brand: "Realme", model: "Realme 11 Pro+",
    short: "Dimensity 7050, tele 2x, thiết kế da.",
    specs: { chip: "Dimensity 7050", screen: '6.7" AMOLED 120Hz', camera: "100MP + 2MP tele + 8MP ultra", battery: "5000 mAh", os: "Realme UI 4", storage: "256GB" },
    prices: [{ source: "Shopee", price: 8490000 }, { source: "Lazada", price: 8790000 }],
  },
  {
    name: "Realme 11 256GB", brand: "Realme", model: "Realme 11",
    short: "Dimensity 6020, AMOLED 90Hz, giá tốt.",
    specs: { chip: "Dimensity 6020", screen: '6.4" AMOLED 90Hz', camera: "64MP + 2MP + 2MP", battery: "5000 mAh", os: "Realme UI 4", storage: "256GB" },
    prices: [{ source: "Shopee", price: 5490000 }, { source: "Lazada", price: 5690000 }],
  },
];

// ── Shop data ────────────────────────────────────────────────────────────────
interface ShopData {
  name: string;
  shopeeShopId: string;
  shopeeUrl: string;
  logo: string;
  plan: "starter" | "pro" | "enterprise";
  userId: string;
  products: ShopeeProductData[];
  reviews: ShopReviewData[];
}

interface ShopeeProductData {
  itemId: string;
  name: string;
  image: string;
  imageThumb: string;
  priceMin: number;
  priceMax: number;
  stock: number;
  sold: number;
  rating: number;
  ratingCount: number;
  likes: number;
  url: string;
  shopeeUrl: string;
}

interface ShopReviewData {
  reviewerName: string;
  rating: number;
  content: string;
}

const SHOPS: ShopData[] = [
  {
    name: "Điện Thoại Giá Tốt Hà Nội",
    shopeeShopId: "shop_001",
    shopeeUrl: "https://shopee.vn/dienthoagiagot",
    logo: "https://down-vn.img.susercontent.com/file/logo-placeholder-1.png",
    plan: "pro",
    userId: "user_shop_1",
    products: [
      { itemId: "sp001_01", name: "iPhone 15 128GB (Mới 100% - seal)", image: "https://down-vn.img.susercontent.com/file/iphone15-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/iphone15-1-t.jpg", priceMin: 21490000, priceMax: 22490000, stock: 25, sold: 340, rating: 4.8, ratingCount: 2890, likes: 1200, url: "https://shopee.vn/product/1", shopeeUrl: "https://shopee.vn/product/1" },
      { itemId: "sp001_02", name: "iPhone 14 Pro 128GB (Like new 99%)", image: "https://down-vn.img.susercontent.com/file/iphone14pro-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/iphone14pro-1-t.jpg", priceMin: 22990000, priceMax: 23990000, stock: 12, sold: 185, rating: 4.7, ratingCount: 1560, likes: 890, url: "https://shopee.vn/product/2", shopeeUrl: "https://shopee.vn/product/2" },
      { itemId: "sp001_03", name: "Samsung Galaxy S24 128GB (Mới sealed)", image: "https://down-vn.img.susercontent.com/file/s24-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/s24-1-t.jpg", priceMin: 19490000, priceMax: 20490000, stock: 18, sold: 210, rating: 4.9, ratingCount: 1750, likes: 950, url: "https://shopee.vn/product/3", shopeeUrl: "https://shopee.vn/product/3" },
      { itemId: "sp001_04", name: "Xiaomi 14 256GB (Bản quốc tế)", image: "https://down-vn.img.susercontent.com/file/xiaomi14-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/xiaomi14-1-t.jpg", priceMin: 19990000, priceMax: 20990000, stock: 30, sold: 420, rating: 4.6, ratingCount: 3200, likes: 1500, url: "https://shopee.vn/product/4", shopeeUrl: "https://shopee.vn/product/4" },
      { itemId: "sp001_05", name: "OPPO Reno11 128GB (Mới 100%)", image: "https://down-vn.img.susercontent.com/file/reno11-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/reno11-1-t.jpg", priceMin: 9490000, priceMax: 9990000, stock: 40, sold: 560, rating: 4.5, ratingCount: 2100, likes: 1100, url: "https://shopee.vn/product/5", shopeeUrl: "https://shopee.vn/product/5" },
      { itemId: "sp001_06", name: "iPhone 13 128GB (Renewed - mở hộp)", image: "https://down-vn.img.susercontent.com/file/iphone13-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/iphone13-1-t.jpg", priceMin: 15490000, priceMax: 16490000, stock: 15, sold: 280, rating: 4.4, ratingCount: 980, likes: 600, url: "https://shopee.vn/product/6", shopeeUrl: "https://shopee.vn/product/6" },
      { itemId: "sp001_07", name: "Samsung Galaxy A55 128GB (Mới)", image: "https://down-vn.img.susercontent.com/file/a55-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/a55-1-t.jpg", priceMin: 9490000, priceMax: 9890000, stock: 50, sold: 620, rating: 4.7, ratingCount: 4100, likes: 2000, url: "https://shopee.vn/product/7", shopeeUrl: "https://shopee.vn/product/7" },
    ],
    reviews: [
      { reviewerName: "Nguyễn Văn A", rating: 5, content: "Máy đẹp, seal nguyên, giao hàng nhanh. Shop uy tín lắm, sẽ ủng hộ tiếp!" },
      { reviewerName: "Trần Thị B", rating: 5, content: "Mua iPhone 15 ở đây, giá tốt hơn Tiki Lazada nhiều. Đóng gói cẩn thận." },
      { reviewerName: "Lê Văn C", rating: 4, content: "Máy ổn, đúng như mô tả. Giao hơi chậm 1 ngày nhưng không vấn đề gì." },
      { reviewerName: "Phạm Thị D", rating: 5, content: "Đã mua 2 lần, đều hài lòng. Tư vấn nhiệt tình, không ép mua." },
      { reviewerName: "Hoàng Văn E", rating: 4, content: "Giá tốt, bảo hành đầy đủ. Cho 4 sao vì giao hàng hơi lâu." },
      { reviewerName: "Đỗ Thị F", rating: 5, content: "Shop đáng tin cậy, máy nguyên seal, phụ kiện đầy đủ hộp." },
      { reviewerName: "Vũ Văn G", rating: 3, content: "Máy ổn nhưng đóng gói hơi sơ sài. Mong shop cải thiện." },
      { reviewerName: "Bùi Thị H", rating: 5, content: "Tuyệt vời! Mua Samsung S24 giá quá tốt, sẽ giới thiệu bạn bè." },
      { reviewerName: "Ngô Văn I", rating: 4, content: "Nhận máy đúng hẹn, test thấy ổn. Hài lòng với mức giá." },
      { reviewerName: "Đinh Thị K", rating: 5, content: "Chất lượng phục vụ 10 điểm. Nhân viên tư vấn rất tận tâm." },
      { reviewerName: "Nguyễn Văn L", rating: 4, content: "Giá cạnh tranh, có bảo hành. Nên mua ở đây." },
      { reviewerName: "Trần Văn M", rating: 5, content: "Mua lần thứ 3 rồi, luôn tin tưởng shop này. Good job!" },
      { reviewerName: "Lý Thị N", rating: 3, content: "Máy ổn nhưng phụ kiện đi kèm không đủ. Cần bổ sung." },
      { reviewerName: "Phan Văn O", rating: 5, content: "Rất hài lòng, giá tốt hơn thị trường 1-2 triệu. Shop chất lượng!" },
      { reviewerName: "Hồ Thị P", rating: 4, content: "Nói chung ổn, không có gì để phàn nàn. Sẽ quay lại mua tiếp." },
    ],
  },
  {
    name: "Smartphone Store Sài Gòn",
    shopeeShopId: "shop_002",
    shopeeUrl: "https://shopee.vn/smartphonessaigon",
    logo: "https://down-vn.img.susercontent.com/file/logo-placeholder-2.png",
    plan: "enterprise",
    userId: "user_shop_2",
    products: [
      { itemId: "sp002_01", name: "iPhone 15 Pro Max 256GB (VN/A fullbox)", image: "https://down-vn.img.susercontent.com/file/ip15pm-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/ip15pm-1-t.jpg", priceMin: 33990000, priceMax: 34990000, stock: 20, sold: 510, rating: 4.9, ratingCount: 4500, likes: 2500, url: "https://shopee.vn/product/101", shopeeUrl: "https://shopee.vn/product/101" },
      { itemId: "sp002_02", name: "Samsung Galaxy S24 Ultra 256GB", image: "https://down-vn.img.susercontent.com/file/s24u-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/s24u-1-t.jpg", priceMin: 28990000, priceMax: 29990000, stock: 15, sold: 380, rating: 4.8, ratingCount: 3200, likes: 1800, url: "https://shopee.vn/product/102", shopeeUrl: "https://shopee.vn/product/102" },
      { itemId: "sp002_03", name: "Xiaomi 14 Pro 256GB (Bản toàn cầu)", image: "https://down-vn.img.susercontent.com/file/x14p-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/x14p-1-t.jpg", priceMin: 23490000, priceMax: 24490000, stock: 22, sold: 290, rating: 4.7, ratingCount: 1800, likes: 1000, url: "https://shopee.vn/product/103", shopeeUrl: "https://shopee.vn/product/103" },
      { itemId: "sp002_04", name: "OPPO Find X7 Ultra 256GB", image: "https://down-vn.img.susercontent.com/file/fx7u-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/fx7u-1-t.jpg", priceMin: 23990000, priceMax: 24990000, stock: 8, sold: 95, rating: 4.6, ratingCount: 670, likes: 450, url: "https://shopee.vn/product/104", shopeeUrl: "https://shopee.vn/product/104" },
      { itemId: "sp002_05", name: "iPhone 13 Pro Max 256GB (Like new)", image: "https://down-vn.img.susercontent.com/file/ip13pm-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/ip13pm-1-t.jpg", priceMin: 23490000, priceMax: 24490000, stock: 10, sold: 150, rating: 4.8, ratingCount: 1200, likes: 700, url: "https://shopee.vn/product/105", shopeeUrl: "https://shopee.vn/product/105" },
      { itemId: "sp002_06", name: "Redmi Note 13 Pro+ 256GB", image: "https://down-vn.img.susercontent.com.file/rn13pp-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/rn13pp-1-t.jpg", priceMin: 7990000, priceMax: 8490000, stock: 60, sold: 890, rating: 4.5, ratingCount: 5600, likes: 2800, url: "https://shopee.vn/product/106", shopeeUrl: "https://shopee.vn/product/106" },
      { itemId: "sp002_07", name: "Poco X6 Pro 256GB", image: "https://down-vn.img.susercontent.com/file/px6p-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/px6p-1-t.jpg", priceMin: 7990000, priceMax: 8490000, stock: 45, sold: 720, rating: 4.6, ratingCount: 3800, likes: 1900, url: "https://shopee.vn/product/107", shopeeUrl: "https://shopee.vn/product/107" },
      { itemId: "sp002_08", name: "Realme 12 Pro+ 256GB", image: "https://down-vn.img.susercontent.com/file/rm12pp-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/rm12pp-1-t.jpg", priceMin: 9490000, priceMax: 9890000, stock: 35, sold: 430, rating: 4.4, ratingCount: 2100, likes: 1100, url: "https://shopee.vn/product/108", shopeeUrl: "https://shopee.vn/product/108" },
    ],
    reviews: [
      { reviewerName: "Trần Văn Bình", rating: 5, content: "Shop chuyên nghiệp, giao hàng siêu nhanh trong ngày. Đã mua 3 lần đều ưng." },
      { reviewerName: "Nguyễn Thị Mai", rating: 5, content: "Máy nguyên seal, đủ phụ kiện. Giá cạnh tranh nhất Sài Gòn." },
      { reviewerName: "Lê Hoàng Nam", rating: 5, content: "Tư vấn rất nhiệt tình, tìm đúng máy khách cần. 5 sao!" },
      { reviewerName: "Phạm Quốc Anh", rating: 4, content: "Giao hàng đúng hẹn, máy đẹp. Nhưng khuyến mãi hơi ít." },
      { reviewerName: "Võ Thị Hồng", rating: 5, content: "Mua S24 Ultra ở đây, giá tốt hơn nhiều shop khác. Cảm ơn shop!" },
      { reviewerName: "Đặng Văn Tuấn", rating: 4, content: "Dịch vụ tốt, hỗ trợ trả góp 0%. Đánh giá 4 sao." },
      { reviewerName: "Bùi Thị Lan", rating: 5, content: "Mua tặng bạn trai, bạn ấy rất thích. Đóng gói đẹp như quà tặng." },
      { reviewerName: "Ngô Minh Đức", rating: 3, content: "Máy ổn nhưng chờ giao hơi lâu do khu vực xa." },
      { reviewerName: "Lý Văn Hùng", rating: 5, content: "Shop uy tín top đầu, đã giới thiệu 3 người bạn mua ở đây." },
      { reviewerName: "Hoàng Thị Yến", rating: 4, content: "Chất lượng tốt, giá hợp lý. Nên mua nếu bạn ở Sài Gòn." },
      { reviewerName: "Đỗ Văn Khoa", rating: 5, content: "Lần 2 mua, vẫn 5 sao. Bảo hành chu đáo." },
      { reviewerName: "Trịnh Thị Mai", rating: 4, content: "Nhân viên thân thiện, máy đúng mô tả. Sẽ quay lại." },
      { reviewerName: "Phan Văn Dũng", rating: 5, content: "Giá tốt + dịch vụ tốt = combo hoàn hảo. Cảm ơn shop!" },
      { reviewerName: "Lưu Thị Ngọc", rating: 4, content: "Khá hài lòng, máy mới 100%. Chỉ hơi lâu đóng gói." },
      { reviewerName: "Tạ Văn Phong", rating: 5, content: "Mua iPhone 14 Pro Max, shop tặng kèm ốp lưng. Rất chi là chu đáo!" },
    ],
  },
  {
    name: "Mobile Center Đà Nẵng",
    shopeeShopId: "shop_003",
    shopeeUrl: "https://shopee.vn/mobilecenterdn",
    logo: "https://down-vn.img.susercontent.com/file/logo-placeholder-3.png",
    plan: "starter",
    userId: "user_shop_3",
    products: [
      { itemId: "sp003_01", name: "Xiaomi 14 256GB (Bản VN)", image: "https://down-vn.img.susercontent.com/file/x14-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/x14-1-t.jpg", priceMin: 19990000, priceMax: 20990000, stock: 20, sold: 180, rating: 4.5, ratingCount: 1100, likes: 600, url: "https://shopee.vn/product/201", shopeeUrl: "https://shopee.vn/product/201" },
      { itemId: "sp003_02", name: "Samsung Galaxy A54 128GB", image: "https://down-vn.img.susercontent.com/file/a54-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/a54-1-t.jpg", priceMin: 7990000, priceMax: 8490000, stock: 45, sold: 650, rating: 4.4, ratingCount: 4200, likes: 2100, url: "https://shopee.vn/product/202", shopeeUrl: "https://shopee.vn/product/202" },
      { itemId: "sp003_03", name: "OPPO Reno11 128GB", image: "https://down-vn.img.susercontent.com/file/rn11-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/rn11-1-t.jpg", priceMin: 9490000, priceMax: 9890000, stock: 35, sold: 420, rating: 4.3, ratingCount: 2300, likes: 1200, url: "https://shopee.vn/product/203", shopeeUrl: "https://shopee.vn/product/203" },
      { itemId: "sp003_04", name: "Redmi Note 13 Pro 256GB", image: "https://down-vn.img.susercontent.com/file/rn13p-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/rn13p-1-t.jpg", priceMin: 6790000, priceMax: 7190000, stock: 55, sold: 780, rating: 4.5, ratingCount: 5100, likes: 2600, url: "https://shopee.vn/product/204", shopeeUrl: "https://shopee.vn/product/204" },
      { itemId: "sp003_05", name: "iPhone 12 64GB (Like new)", image: "https://down-vn.img.susercontent.com/file/ip12-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/ip12-1-t.jpg", priceMin: 11990000, priceMax: 12990000, stock: 18, sold: 240, rating: 4.2, ratingCount: 1400, likes: 700, url: "https://shopee.vn/product/205", shopeeUrl: "https://shopee.vn/product/205" },
      { itemId: "sp003_06", name: "Realme 11 256GB", image: "https://down-vn.img.susercontent.com/file/rm11-1.jpg", imageThumb: "https://down-vn.img.susercontent.com/file/rm11-1-t.jpg", priceMin: 5490000, priceMax: 5890000, stock: 40, sold: 530, rating: 4.1, ratingCount: 2800, likes: 1400, url: "https://shopee.vn/product/206", shopeeUrl: "https://shopee.vn/product/206" },
    ],
    reviews: [
      { reviewerName: "Nguyễn Văn Tùng", rating: 4, content: "Giá tốt ở Đà Nẵng, giao hàng nhanh trong thành phố." },
      { reviewerName: "Trần Thị Hương", rating: 5, content: "Mua Xiaomi 14, shop tư vấn rất nhiệt tình. Cảm ơn!" },
      { reviewerName: "Lê Văn Hải", rating: 4, content: "Máy ổn, giá hợp lý. Đã mua 2 lần ở đây." },
      { reviewerName: "Phạm Thị Linh", rating: 3, content: "Giao hàng hơi lâu, đợi 4 ngày mới nhận được." },
      { reviewerName: "Hoàng Văn Minh", rating: 5, content: "Rất ưng ý, giá tốt hơn các shop khác ở ĐN. Sẽ quay lại." },
      { reviewerName: "Đỗ Thị Thu", rating: 4, content: "Máy đẹp, đúng mô tả. Đóng gói cẩn thận." },
      { reviewerName: "Vũ Văn Long", rating: 5, content: "Shop ĐN uy tín, đã mua 3 máy cho người thân. Good!" },
      { reviewerName: "Bùi Thị Mai", rating: 3, content: "Khá ổn nhưng chính sách đổi trả hơi rắc rối." },
      { reviewerName: "Ngô Văn Tú", rating: 4, content: "Giá tốt, máy mới 100%. Nên mua nếu bạn ở ĐN." },
      { reviewerName: "Đinh Văn Sơn", rating: 5, content: "Mua Redmi Note 13 Pro, giá quá tốt. Cảm ơn shop!" },
      { reviewerName: "Lý Thị Hoa", rating: 4, content: "Dịch vụ tốt, nhân viên nhiệt tình. Sẽ ủng hộ tiếp." },
      { reviewerName: "Hồ Văn Đạt", rating: 3, content: "Máy ổn nhưng phụ kiện đi kèm hơi ít." },
      { reviewerName: "Phan Thị Nga", rating: 5, content: "Mua tặng chồng, anh ấy rất thích. Shop chu đáo!" },
      { reviewerName: "Tạ Văn Quang", rating: 4, content: "Khá hài lòng, giá cạnh tranh. Sẽ giới thiệu bạn bè." },
      { reviewerName: "Nguyễn Thị Bích", rating: 4, content: "Máy đẹp, giá tốt. Cho 4 sao vì giao hơi lâu." },
      { reviewerName: "Trần Văn Phúc", rating: 5, content: "Mua A54, giá quá tốt. Bảo hành 12 tháng đầy đủ." },
      { reviewerName: "Lê Thị Ánh", rating: 3, content: "Tạm được, không có gì nổi bật." },
      { reviewerName: "Võ Văn Tài", rating: 4, content: "Đã mua 2 lần, đều hài lòng. Shop đáng tin cậy." },
    ],
  },
];

// ── Platform news ────────────────────────────────────────────────────────────
const NEWS = [
  {
    title: "iPhone 16 Pro Max giảm giá kỷ lục cuối năm 2025",
    tag: "Khuyến mãi", color: "bg-red-100 text-red-700",
    link: "https://example.com/news/iphone16-sale",
  },
  {
    title: "Samsung Galaxy S25 series sẽ ra mắt đầu 2026",
    tag: "Rumor", color: "bg-yellow-100 text-yellow-700",
    link: "https://example.com/news/s25-rumor",
  },
  {
    title: "Thị trường điện thoại cũ VN tăng trưởng 35% năm 2025",
    tag: "Thị trường", color: "bg-blue-100 text-blue-700",
    link: "https://example.com/news/used-phone-vn",
  },
  {
    title: "OPPO Find X8 series sắp về Việt Nam",
    tag: "Sản phẩm mới", color: "bg-green-100 text-green-700",
    link: "https://example.com/news/oppo-find-x8",
  },
  {
    title: "Xiaomi 15 series lộ diện: Dimensity 9400",
    tag: "Rumor", color: "bg-yellow-100 text-yellow-700",
    link: "https://example.com/news/xiaomi-15",
  },
  {
    title: "Shopee 11.11: Giảm đến 50% điện thoại",
    tag: "Khuyến mãi", color: "bg-red-100 text-red-700",
    link: "https://example.com/news/shopee-1111",
  },
  {
    title: "iPhone 15 Pro Max được bình chọn điện thoại của năm",
    tag: "Review", color: "bg-purple-100 text-purple-700",
    link: "https://example.com/news/phone-of-year",
  },
  {
    title: "Lazada 12.12: So sánh giá iPhone 15 các shop",
    tag: "So sánh giá", color: "bg-cyan-100 text-cyan-700",
    link: "https://example.com/news/lazada-1212",
  },
];

// ── Main seed logic ──────────────────────────────────────────────────────────
async function resetAll() {
  console.log("⚠  Resetting database...");
  // Delete in reverse dependency order
  await prisma.shopReview.deleteMany();
  await prisma.shopMetric.deleteMany();
  await prisma.shopeeProduct.deleteMany();
  await prisma.crawlLog.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.price.deleteMany();
  await prisma.product.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformNews.deleteMany();
  console.log("  Database wiped.\n");
}

async function seedUsers() {
  console.log("▸ Seeding Users...");

  const users = [
    { email: "admin@reviewpilot.vn", name: "Admin ReviewPilot", password: "Admin@123456", role: "ADMIN" as const },
    { email: "shopowner1@gmail.com", name: "Nguyễn Văn Chủ Shop 1", password: "Shop@123456", role: "SHOP_OWNER" as const },
    { email: "shopowner2@gmail.com", name: "Trần Thị Chủ Shop 2", password: "Shop@123456", role: "SHOP_OWNER" as const },
    { email: "shopowner3@gmail.com", name: "Lê Văn Chủ Shop 3", password: "Shop@123456", role: "SHOP_OWNER" as const },
  ];

  for (const u of users) {
    const hash = await hashPassword(u.password);
    const user = await prisma.user.create({
      data: { email: u.email, name: u.name, passwordHash: hash, role: u.role, status: "active" },
      select: { id: true, email: true, name: true, role: true },
    });
    console.log(`  ✓ ${u.email} (${u.role}) id=${user.id}`);
  }
  return users;
}

async function seedProducts() {
  console.log("\n▸ Seeding Products + Prices + PriceHistory...");

  // Get shop user IDs for shop relation
  const shop1User = await prisma.user.findUnique({ where: { email: "shopowner1@gmail.com" } });
  const shop2User = await prisma.user.findUnique({ where: { email: "shopowner2@gmail.com" } });
  const shop3User = await prisma.user.findUnique({ where: { email: "shopowner3@gmail.com" } });

  const userIds = {
    [SHOPS[0].userId]: shop1User!.id,
    [SHOPS[1].userId]: shop2User!.id,
    [SHOPS[2].userId]: shop3User!.id,
  };

  for (const p of PHONES) {
    try {
      const product = await prisma.product.create({
        data: {
          name: p.name,
          slug: slug(p.name),
          brand: p.brand,
          model: p.model,
          imageUrl: "",
          shortDescription: p.short,
          specs: p.specs,
          status: "active",
          prices: { create: p.prices.map((pr) => ({ source: pr.source, price: pr.price })) },
        },
      });

      // 30 days of price history
      const baseDate = daysAgo(29);
      const basePrice = p.prices[0].price;
      let running = basePrice;

      for (let day = 0; day < 30; day++) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + day);
        const drift = (Math.random() - 0.48) * 800000;
        running = Math.max(running * 0.995 + drift, running * 0.97);
        const daily = p.prices.map((s) => Math.round(s.price + (Math.random() - 0.5) * 600000));
        const avg = Math.round(daily.reduce((a, b) => a + b, 0) / daily.length);

        await prisma.priceHistory.upsert({
          where: { productId_date: { productId: product.id, date: d } } as never,
          update: { avgPrice: avg, minPrice: Math.min(...daily), maxPrice: Math.max(...daily) },
          create: { productId: product.id, date: d, avgPrice: avg, minPrice: Math.min(...daily), maxPrice: Math.max(...daily) },
        });
      }

      console.log(`  ✓ ${p.name}`);
    } catch (err) {
      console.error(`  ✗ ${p.name}: ${(err as Error).message}`);
    }
  }
}

async function seedShops() {
  console.log("\n▸ Seeding Shops...");

  for (const s of SHOPS) {
    const user = await prisma.user.findUnique({ where: { email: `shopowner${SHOPS.indexOf(s) + 1}@gmail.com` } });
    const shop = await prisma.shop.create({
      data: {
        name: s.name,
        shopeeShopId: s.shopeeShopId,
        shopeeUrl: s.shopeeUrl,
        logo: s.logo,
        plan: s.plan,
        status: "active",
        monthlyQuota: s.plan === "enterprise" ? 2000 : s.plan === "pro" ? 1000 : 500,
        userId: user!.id,
      },
    });
    console.log(`  ✓ ${s.name} (${s.plan}) id=${shop.id}`);

    // Seed shopee products
    for (const sp of s.products) {
      await prisma.shopeeProduct.create({
        data: {
          shopId: shop.id,
          itemId: sp.itemId,
          name: sp.name,
          slug: slug(sp.name),
          image: sp.image,
          imageThumb: sp.imageThumb,
          priceMin: sp.priceMin,
          priceMax: sp.priceMax,
          stock: sp.stock,
          sold: sp.sold,
          rating: sp.rating,
          ratingCount: sp.ratingCount,
          likes: sp.likes,
          url: sp.url,
          shopeeUrl: sp.shopeeUrl,
          status: "active",
        },
      });
    }
    console.log(`    └ ${s.products.length} ShopeeProducts`);

    // Seed shop reviews
    for (const rv of s.reviews) {
      await prisma.shopReview.create({
        data: {
          shopId: shop.id,
          reviewerName: rv.reviewerName,
          rating: rv.rating,
          content: rv.content,
          status: "approved",
        },
      });
    }
    console.log(`    └ ${s.reviews.length} ShopReviews`);

    // Seed 30 days of shop metrics
    for (let day = 29; day >= 0; day--) {
      const d = daysAgo(day);
      await prisma.shopMetric.create({
        data: {
          shopId: shop.id,
          date: d,
          revenue: randomFloat(s.plan === "enterprise" ? 80000000 : s.plan === "pro" ? 50000000 : 20000000, s.plan === "enterprise" ? 150000000 : s.plan === "pro" ? 90000000 : 40000000, 0),
          orders: randomInt(s.plan === "enterprise" ? 80 : s.plan === "pro" ? 50 : 20, s.plan === "enterprise" ? 150 : s.plan === "pro" ? 100 : 50),
          visitors: randomInt(s.plan === "enterprise" ? 2000 : s.plan === "pro" ? 1200 : 500, s.plan === "enterprise" ? 4000 : s.plan === "pro" ? 2500 : 1000),
        },
      });
    }
    console.log(`    └ 30 days ShopMetrics`);
  }
}

async function seedPlatformNews() {
  console.log("\n▸ Seeding PlatformNews...");

  const now = today();
  for (let i = 0; i < NEWS.length; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * 2);
    await prisma.platformNews.create({
      data: {
        title: NEWS[i].title,
        tag: NEWS[i].tag,
        color: NEWS[i].color,
        link: NEWS[i].link,
        publishedAt: d,
      },
    });
    console.log(`  ✓ ${NEWS[i].title.substring(0, 50)}...`);
  }
}

// ── Entry point ──────────────────────────────────────────────────────────────
async function main() {
  const start = Date.now();
  console.log("=== ReviewPilot Database Seed ===\n");

  if (RESET) {
    await resetAll();
  } else {
    // Check if data already exists
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    if (userCount > 0 || productCount > 0) {
      console.log(`⚠  Database already has data (${userCount} users, ${productCount} products).`);
      console.log("   Run with --reset to wipe and re-seed.\n");
      process.exit(0);
    }
  }

  try {
    const users = await seedUsers();
    await seedProducts();
    await seedShops();
    await seedPlatformNews();

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\n✅ Seed complete in ${elapsed}s`);

    // Print summary
    const counts = {
      users: await prisma.user.count(),
      products: await prisma.product.count(),
      prices: await prisma.price.count(),
      priceHistory: await prisma.priceHistory.count(),
      shops: await prisma.shop.count(),
      shopeeProducts: await prisma.shopeeProduct.count(),
      shopReviews: await prisma.shopReview.count(),
      shopMetrics: await prisma.shopMetric.count(),
      platformNews: await prisma.platformNews.count(),
    };
    console.log("\n📊 Summary:");
    for (const [k, v] of Object.entries(counts)) {
      console.log(`   ${k}: ${v}`);
    }

    console.log("\n🔑 Login credentials:");
    for (const u of users) {
      console.log(`   ${u.email} / ${u.password}`);
    }
  } catch (err) {
    console.error("\n❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
