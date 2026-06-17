"use server";

import { db } from "@/lib/db";
import { ShopeeProduct } from "@prisma/client";

const DEMO_PRODUCTS: Array<{
  name: string;
  priceMin: number;
  priceMax: number;
  originalPrice: number;
  stock: number;
  sold: number;
  rating: number;
  ratingCount: number;
  image: string;
}> = [
  {
    name: "iPhone 15 Pro Max 256GB | Chính hãng VN/A",
    priceMin: 26990000,
    priceMax: 27990000,
    originalPrice: 32990000,
    stock: 45,
    sold: 1283,
    rating: 4.9,
    ratingCount: 2847,
    image: "https://down-vn.img.susercontent.com/file/7cb87c4d0d92f73e1d4ab4e7b6fa2a31",
  },
  {
    name: "Samsung Galaxy S24 Ultra 5G 256GB",
    priceMin: 24990000,
    priceMax: 25990000,
    originalPrice: 30990000,
    stock: 30,
    sold: 892,
    rating: 4.8,
    ratingCount: 1923,
    image: "https://down-vn.img.susercontent.com/file/5c5936ed6a2b7f31e27c8baae41e2c09",
  },
  {
    name: "MacBook Air M2 13.6 inch 8GB 256GB",
    priceMin: 22990000,
    priceMax: 23990000,
    originalPrice: 26990000,
    stock: 20,
    sold: 567,
    rating: 4.9,
    ratingCount: 1456,
    image: "https://down-vn.img.susercontent.com/file/a1594e9081b8c0c4a8e2e4b5d7e2f3a1",
  },
  {
    name: "AirPods Pro 2 (USB-C) Chính hãng",
    priceMin: 5290000,
    priceMax: 5690000,
    originalPrice: 6490000,
    stock: 120,
    sold: 3456,
    rating: 4.8,
    ratingCount: 5672,
    image: "https://down-vn.img.susercontent.com/file/9f40a7d05c4c4c1a7c7e8f8a7b6c5d4e",
  },
  {
    name: "Sạc nhanh Apple 20W USB-C chính hãng",
    priceMin: 390000,
    priceMax: 450000,
    originalPrice: 590000,
    stock: 300,
    sold: 8934,
    rating: 4.7,
    ratingCount: 3421,
    image: "https://down-vn.img.susercontent.com/file/3a1e2d3c4b5a69788980706050403020",
  },
  {
    name: "Ốp lưng iPhone 15 Pro Max trong suốt MagSafe",
    priceMin: 89000,
    priceMax: 129000,
    originalPrice: 199000,
    stock: 500,
    sold: 12450,
    rating: 4.6,
    ratingCount: 7823,
    image: "https://down-vn.img.susercontent.com/file/2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
  },
  {
    name: "iPad Pro M4 11 inch 256GB WiFi",
    priceMin: 20990000,
    priceMax: 21990000,
    originalPrice: 24990000,
    stock: 15,
    sold: 234,
    rating: 4.9,
    ratingCount: 876,
    image: "https://down-vn.img.susercontent.com/file/4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9",
  },
  {
    name: "Apple Watch Series 9 GPS 45mm",
    priceMin: 8490000,
    priceMax: 8990000,
    originalPrice: 9990000,
    stock: 60,
    sold: 1567,
    rating: 4.7,
    ratingCount: 2134,
    image: "https://down-vn.img.susercontent.com/file/5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
  },
  {
    name: "Cáp sạc USB-C to Lightning 1m chính hãng Apple",
    priceMin: 290000,
    priceMax: 350000,
    originalPrice: 490000,
    stock: 400,
    sold: 15678,
    rating: 4.5,
    ratingCount: 4532,
    image: "https://down-vn.img.susercontent.com/file/6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1",
  },
  {
    name: "Dán cường lực iPhone 15 Pro Max full màn",
    priceMin: 79000,
    priceMax: 149000,
    originalPrice: 199000,
    stock: 800,
    sold: 23456,
    rating: 4.4,
    ratingCount: 12340,
    image: "https://down-vn.img.susercontent.com/file/7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
  },
  {
    name: "Ốp lưng Samsung S24 Ultra da PU cao cấp",
    priceMin: 159000,
    priceMax: 199000,
    originalPrice: 299000,
    stock: 200,
    sold: 3456,
    rating: 4.6,
    ratingCount: 1876,
    image: "https://down-vn.img.susercontent.com/file/8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
  },
  {
    name: "Tai nghe Sony WH-1000XM5 chống ồn",
    priceMin: 5990000,
    priceMax: 6490000,
    originalPrice: 7990000,
    stock: 35,
    sold: 678,
    rating: 4.9,
    ratingCount: 1234,
    image: "https://down-vn.img.susercontent.com/file/9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
  },
];

function makeVariants(idx: number, shopId: string) {
  const base = DEMO_PRODUCTS[idx % DEMO_PRODUCTS.length];
  const variants = ["Đen", "Trắng", "Xanh", "Bạc", "Vàng"];
  const attr = [
    { name: "Màu sắc", value: variants[idx % variants.length] },
    { name: "Tình trạng", value: "Mới 100%" },
  ];
  const cats = ["Điện thoại & Phụ kiện", idx < 4 ? "Điện thoại" : "Phụ kiện"];
  return { ...base, attributes: JSON.stringify(attr), categories: JSON.stringify(cats) };
}

export async function seedDemoProducts() {
  const shops = await db.shop.findMany();
  if (shops.length === 0) throw new Error("No shops found — seed shops first.");

  console.log(`Seeding demo products for ${shops.length} shops...`);
  let total = 0;

  for (const shop of shops) {
    const count = Math.min(8, DEMO_PRODUCTS.length);
    for (let i = 0; i < count; i++) {
      const p = makeVariants(i, shop.id);
      const slug = `${shop.id}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}-${i}`;

      const existing = await db.shopeeProduct.findFirst({ where: { slug, shopId: shop.id } });
      if (existing) continue;

      await db.shopeeProduct.create({
        data: {
          shopId: shop.id,
          itemId: `${Date.now()}${i}${Math.floor(Math.random() * 1000)}`,
          name: p.name,
          slug,
          image: p.image,
          imageThumb: p.image,
          priceMin: p.priceMin,
          priceMax: p.priceMax,
          originalPrice: p.originalPrice,
          stock: p.stock + Math.floor(Math.random() * 20 - 10),
          sold: p.sold + Math.floor(Math.random() * 500),
          rating: p.rating + (Math.random() * 0.2 - 0.1),
          ratingCount: p.ratingCount + Math.floor(Math.random() * 200),
          likes: Math.floor(p.sold * 0.3),
          status: "active",
          attributes: p.attributes,
          categories: p.categories,
          url: `https://shopee.vn/product/i/${shop.shopeeShopId ?? "12345"}/${Date.now()}${i}`,
          shopeeUrl: `https://shopee.vn/product/i/${shop.shopeeShopId ?? "12345"}/${Date.now()}${i}`,
        },
      });
      total++;
    }
    console.log(`  ✓ ${shop.name}: ${count} products`);
  }

  console.log(`Done — ${total} products seeded.`);
}

export async function simulateCrawl(shopId: string): Promise<{ added: number; updated: number }> {
  const shop = await db.shop.findUnique({ where: { id: shopId } });
  if (!shop) throw new Error("Shop not found");

  let added = 0, updated = 0;
  const count = Math.min(6, DEMO_PRODUCTS.length);

  for (let i = 0; i < count; i++) {
    const p = makeVariants(i, shopId);
    const priceVariation = 1 + (Math.random() * 0.1 - 0.05);
    const slug = `${shopId}-demo-${Date.now()}-${i}`;

    const existing = await db.shopeeProduct.findFirst({
      where: { shopId, name: { contains: p.name.slice(0, 20) } },
    });

    const data = {
      priceMin: Math.round(p.priceMin * priceVariation / 1000) * 1000,
      priceMax: Math.round(p.priceMax * priceVariation / 1000) * 1000,
      stock: Math.max(0, p.stock + Math.floor(Math.random() * 10 - 5)),
      sold: p.sold + Math.floor(Math.random() * 100),
      rating: Math.min(5, p.rating + (Math.random() * 0.1 - 0.05)),
      lastSyncedAt: new Date(),
    };

    if (existing) {
      await db.shopeeProduct.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await db.shopeeProduct.create({
        data: {
          shopId,
          itemId: `${Date.now()}${i}`,
          name: p.name,
          slug,
          image: p.image,
          imageThumb: p.image,
          priceMin: data.priceMin,
          priceMax: data.priceMax,
          originalPrice: p.originalPrice,
          stock: data.stock,
          sold: data.sold,
          rating: data.rating,
          ratingCount: p.ratingCount,
          likes: Math.floor(data.sold * 0.3),
          status: "active",
          attributes: p.attributes,
          categories: p.categories,
          url: `https://shopee.vn/product/i/${shop.shopeeShopId ?? "demo"}/${Date.now()}${i}`,
          shopeeUrl: `https://shopee.vn/product/i/${shop.shopeeShopId ?? "demo"}/${Date.now()}${i}`,
        },
      });
      added++;
    }
  }

  await db.shop.update({
    where: { id: shopId },
    data: { crawlUsed: { increment: 1 }, lastCrawledAt: new Date() },
  });

  return { added, updated };
}
