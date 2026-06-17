import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const slug = (s: string) =>
  s.toLowerCase()
   .normalize("NFD")
   .replace(/[À-ỹ]/g, c => "")
   .replace(/[^a-z0-9\s-]/g, "")
   .replace(/\s+/g, "-")
   .replace(/-+/g, "-")
   .replace(/^-|-$/g, "");

const phones = [
  { name: "iPhone 15 Pro Max 256GB", brand: "Apple", model: "iPhone 15 Pro Max", storage: "256GB", short: "Chip A17 Pro, titanium design, camera 48MP, màn hình Super Retina XDR 6.7 inch.", specs: { chip: "A17 Pro", screen: '6.7" Super Retina XDR 120Hz', camera: "48MP + 12MP + 12MP", battery: "4441 mAh", os: "iOS 17", storage: "256GB" }, prices: [{ source: "Shopee", price: 33990000 }, { source: "Lazada", price: 34490000 }, { source: "Tiki", price: 34990000 }] },
  { name: "iPhone 15 Pro 128GB", brand: "Apple", model: "iPhone 15 Pro", storage: "128GB", short: "Chip A17 Pro, titanium, Dynamic Island.", specs: { chip: "A17 Pro", screen: '6.1" Super Retina XDR 120Hz', camera: "48MP + 12MP + 12MP", battery: "3274 mAh", os: "iOS 17", storage: "128GB" }, prices: [{ source: "Shopee", price: 28990000 }, { source: "Lazada", price: 29490000 }, { source: "Tiki", price: 29990000 }] },
  { name: "iPhone 15 Plus 128GB", brand: "Apple", model: "iPhone 15 Plus", storage: "128GB", short: "Màn hình 6.7 inch, A16, Dynamic Island.", specs: { chip: "A16 Bionic", screen: '6.7" Super Retina XDR', camera: "48MP + 12MP", battery: "4383 mAh", os: "iOS 17", storage: "128GB" }, prices: [{ source: "Shopee", price: 24490000 }, { source: "Lazada", price: 24990000 }] },
  { name: "iPhone 15 128GB", brand: "Apple", model: "iPhone 15", storage: "128GB", short: "A16 Bionic, Dynamic Island, USB-C.", specs: { chip: "A16 Bionic", screen: '6.1" Super Retina XDR', camera: "48MP + 12MP", battery: "3349 mAh", os: "iOS 17", storage: "128GB" }, prices: [{ source: "Shopee", price: 21490000 }, { source: "Lazada", price: 21990000 }] },
  { name: "iPhone 14 Pro Max 256GB", brand: "Apple", model: "iPhone 14 Pro Max", storage: "256GB", short: "Dynamic Island, A16, ProRAW 48MP.", specs: { chip: "A16 Bionic", screen: '6.7" Super Retina XDR', camera: "48MP + 12MP + 12MP", battery: "4323 mAh", os: "iOS 17", storage: "256GB" }, prices: [{ source: "Shopee", price: 27490000 }, { source: "Lazada", price: 27990000 }] },
  { name: "iPhone 14 Pro 128GB", brand: "Apple", model: "iPhone 14 Pro", storage: "128GB", short: "Dynamic Island, A16 Bionic.", specs: { chip: "A16 Bionic", screen: '6.1" Super Retina XDR', camera: "48MP + 12MP + 12MP", battery: "3200 mAh", os: "iOS 17", storage: "128GB" }, prices: [{ source: "Shopee", price: 22990000 }, { source: "Lazada", price: 23490000 }] },
  { name: "iPhone 14 128GB", brand: "Apple", model: "iPhone 14", storage: "128GB", short: "A15 Bionic, Dual-camera 12MP.", specs: { chip: "A15 Bionic", screen: '6.1" Super Retina XDR OLED', camera: "12MP + 12MP", battery: "3279 mAh", os: "iOS 17", storage: "128GB" }, prices: [{ source: "Shopee", price: 18990000 }, { source: "Lazada", price: 19490000 }] },
  { name: "iPhone 14 Plus 128GB", brand: "Apple", model: "iPhone 14 Plus", storage: "128GB", short: "Màn hình 6.7 inch, A15, pin bền.", specs: { chip: "A15 Bionic", screen: '6.7" Super Retina XDR', camera: "12MP + 12MP", battery: "4325 mAh", os: "iOS 17", storage: "128GB" }, prices: [{ source: "Shopee", price: 19990000 }, { source: "Lazada", price: 20490000 }] },
  { name: "iPhone 13 128GB", brand: "Apple", model: "iPhone 13", storage: "128GB", short: "A15 Bionic, OLED 6.1 inch.", specs: { chip: "A15 Bionic", screen: '6.1" Super Retina XDR OLED', camera: "12MP + 12MP", battery: "3227 mAh", os: "iOS 17", storage: "128GB" }, prices: [{ source: "Shopee", price: 15990000 }, { source: "Lazada", price: 16490000 }] },
  { name: "iPhone 13 Pro Max 256GB", brand: "Apple", model: "iPhone 13 Pro Max", storage: "256GB", short: "ProMotion 120Hz, A15, camera 12MP lớn.", specs: { chip: "A15 Bionic", screen: '6.7" Super Retina XDR 120Hz', camera: "12MP + 12MP + 12MP", battery: "4352 mAh", os: "iOS 17", storage: "256GB" }, prices: [{ source: "Shopee", price: 23490000 }, { source: "Lazada", price: 23990000 }] },
  { name: "iPhone 12 64GB", brand: "Apple", model: "iPhone 12", storage: "64GB", short: "A14 Bionic, OLED, MagSafe, 5G.", specs: { chip: "A14 Bionic", screen: '6.1" Super Retina XDR OLED', camera: "12MP + 12MP", battery: "2815 mAh", os: "iOS 17", storage: "64GB" }, prices: [{ source: "Shopee", price: 11990000 }, { source: "Lazada", price: 12490000 }] },
  { name: "iPhone 11 64GB", brand: "Apple", model: "iPhone 11", storage: "64GB", short: "A13 Bionic, Dual-camera 12MP.", specs: { chip: "A13 Bionic", screen: '6.1" Liquid Retina IPS LCD', camera: "12MP + 12MP", battery: "3110 mAh", os: "iOS 17", storage: "64GB" }, prices: [{ source: "Shopee", price: 8990000 }, { source: "Lazada", price: 9290000 }] },
  { name: "iPhone SE 2022 64GB", brand: "Apple", model: "iPhone SE", storage: "64GB", short: "A15 Bionic, Touch ID, 4.7 inch.", specs: { chip: "A15 Bionic", screen: '4.7" Retina IPS LCD', camera: "12MP", battery: "2018 mAh", os: "iOS 17", storage: "64GB" }, prices: [{ source: "Shopee", price: 10490000 }] },
  { name: "Samsung Galaxy S24 Ultra 256GB", brand: "Samsung", model: "Galaxy S24 Ultra", storage: "256GB", short: "SD 8 Gen 3, S Pen, zoom 100x, AI.", specs: { chip: "Snapdragon 8 Gen 3", screen: '6.8" Dynamic AMOLED 2X 120Hz', camera: "200MP + 12MP + 50MP + 10MP", battery: "5000 mAh", os: "Android 14 / One UI 6", storage: "256GB" }, prices: [{ source: "Shopee", price: 28990000 }, { source: "Lazada", price: 29490000 }] },
  { name: "Samsung Galaxy S24+ 256GB", brand: "Samsung", model: "Galaxy S24+", storage: "256GB", short: "SD 8 Gen 3, AI Galaxy, 6.7 inch QHD+.", specs: { chip: "Snapdragon 8 Gen 3", screen: '6.7" Dynamic AMOLED 2X QHD+', camera: "50MP + 12MP + 10MP", battery: "4900 mAh", os: "Android 14 / One UI 6", storage: "256GB" }, prices: [{ source: "Shopee", price: 22990000 }, { source: "Lazada", price: 23490000 }] },
  { name: "Samsung Galaxy S24 128GB", brand: "Samsung", model: "Galaxy S24", storage: "128GB", short: "SD 8 Gen 3, AI Galaxy, camera 50MP.", specs: { chip: "Snapdragon 8 Gen 3", screen: '6.2" Dynamic AMOLED 2X FHD+', camera: "50MP + 12MP + 10MP", battery: "4000 mAh", os: "Android 14 / One UI 6", storage: "128GB" }, prices: [{ source: "Shopee", price: 19490000 }, { source: "Lazada", price: 19990000 }] },
  { name: "Samsung Galaxy S23 Ultra 256GB", brand: "Samsung", model: "Galaxy S23 Ultra", storage: "256GB", short: "SD 8 Gen 2, S Pen, zoom 100x, camera 108MP.", specs: { chip: "Snapdragon 8 Gen 2", screen: '6.8" Dynamic AMOLED 2X 120Hz', camera: "108MP + 12MP + 10MP + 10MP", battery: "5000 mAh", os: "Android 14 / One UI 6", storage: "256GB" }, prices: [{ source: "Shopee", price: 22990000 }, { source: "Lazada", price: 23490000 }] },
  { name: "Samsung Galaxy S23+ 256GB", brand: "Samsung", model: "Galaxy S23+", storage: "256GB", short: "SD 8 Gen 2, camera 50MP.", specs: { chip: "Snapdragon 8 Gen 2", screen: '6.6" Dynamic AMOLED 2X 120Hz', camera: "50MP + 12MP + 10MP", battery: "4700 mAh", os: "Android 14 / One UI 6", storage: "256GB" }, prices: [{ source: "Shopee", price: 18990000 }] },
  { name: "Samsung Galaxy S23 128GB", brand: "Samsung", model: "Galaxy S23", storage: "128GB", short: "SD 8 Gen 2, camera 50MP, compact.", specs: { chip: "Snapdragon 8 Gen 2", screen: '6.1" Dynamic AMOLED 2X 120Hz', camera: "50MP + 12MP + 10MP", battery: "3900 mAh", os: "Android 14 / One UI 6", storage: "128GB" }, prices: [{ source: "Shopee", price: 16490000 }, { source: "Lazada", price: 16990000 }] },
  { name: "Samsung Galaxy S22 Ultra 256GB", brand: "Samsung", model: "Galaxy S22 Ultra", storage: "256GB", short: "S Pen, SD 8 Gen 1, zoom 100x.", specs: { chip: "Snapdragon 8 Gen 1", screen: '6.8" Dynamic AMOLED 2X 120Hz', camera: "108MP + 12MP + 10MP + 10MP", battery: "5000 mAh", os: "Android 14 / One UI 6", storage: "256GB" }, prices: [{ source: "Shopee", price: 19990000 }, { source: "Lazada", price: 20490000 }] },
  { name: "Samsung Galaxy S22+ 128GB", brand: "Samsung", model: "Galaxy S22+", storage: "128GB", short: "SD 8 Gen 1, màn hình 6.6 inch.", specs: { chip: "Snapdragon 8 Gen 1", screen: '6.6" Dynamic AMOLED 2X 120Hz', camera: "50MP + 12MP + 10MP", battery: "4500 mAh", os: "Android 14 / One UI 6", storage: "128GB" }, prices: [{ source: "Shopee", price: 13490000 }, { source: "Lazada", price: 13990000 }] },
  { name: "Samsung Galaxy S22 128GB", brand: "Samsung", model: "Galaxy S22", storage: "128GB", short: "Compact flagship, SD 8 Gen 1.", specs: { chip: "Snapdragon 8 Gen 1", screen: '6.1" Dynamic AMOLED 2X 120Hz', camera: "50MP + 12MP + 10MP", battery: "3700 mAh", os: "Android 14 / One UI 6", storage: "128GB" }, prices: [{ source: "Shopee", price: 11990000 }, { source: "Lazada", price: 12490000 }] },
  { name: "OPPO Reno11 Pro 256GB", brand: "Oppo", model: "Reno11 Pro", storage: "256GB", short: "Dimensity 8200, camera chân dung 32MP, sạc 80W.", specs: { chip: "Dimensity 8200", screen: '6.74" AMOLED 120Hz', camera: "50MP + 8MP + 32MP", battery: "4600 mAh", os: "ColorOS 14", storage: "256GB" }, prices: [{ source: "Shopee", price: 13990000 }] },
  { name: "OPPO Reno11 128GB", brand: "Oppo", model: "Reno11", storage: "128GB", short: "Dimensity 7050, camera 32MP, sạc 67W.", specs: { chip: "Dimensity 7050", screen: '6.7" AMOLED 120Hz', camera: "64MP + 8MP + 32MP", battery: "4800 mAh", os: "ColorOS 14", storage: "128GB" }, prices: [{ source: "Shopee", price: 9490000 }, { source: "Lazada", price: 9790000 }] },
  { name: "OPPO Reno10 5G 256GB", brand: "Oppo", model: "Reno10 5G", storage: "256GB", short: "Dimensity 7050, tele 64MP.", specs: { chip: "Dimensity 7050", screen: '6.7" AMOLED 120Hz', camera: "64MP + 8MP + 32MP", battery: "5000 mAh", os: "ColorOS 13.1", storage: "256GB" }, prices: [{ source: "Shopee", price: 8490000 }] },
  { name: "OPPO Reno9 Pro+ 256GB", brand: "Oppo", model: "Reno9 Pro+", storage: "256GB", short: "SD 8+ Gen 1, RAM 16GB.", specs: { chip: "Snapdragon 8+ Gen 1", screen: '6.7" AMOLED 120Hz', camera: "50MP + 8MP + 32MP", battery: "4700 mAh", os: "ColorOS 13", storage: "256GB" }, prices: [{ source: "Shopee", price: 12490000 }] },
  { name: "OPPO Reno8 T 5G 128GB", brand: "Oppo", model: "Reno8 T 5G", storage: "128GB", short: "Dimensity 7050, camera 108MP.", specs: { chip: "Dimensity 7050", screen: '6.4" AMOLED 90Hz', camera: "108MP + 2MP + 2MP", battery: "4800 mAh", os: "ColorOS 13.1", storage: "128GB" }, prices: [{ source: "Shopee", price: 7190000 }] },
  { name: "OPPO Find N3 Flip 256GB", brand: "Oppo", model: "Find N3 Flip", storage: "256GB", short: "Foldable clamshell, Hasselblad.", specs: { chip: "Dimensity 9200", screen: "6.8 AMOLED + 3.26 cover", camera: "50MP Hasselblad + 8MP + 32MP", battery: "4300 mAh", os: "ColorOS 13.2", storage: "256GB" }, prices: [{ source: "Shopee", price: 20990000 }] },
  { name: "Xiaomi 14 Pro 256GB", brand: "Xiaomi", model: "Xiaomi 14 Pro", storage: "256GB", short: "SD 8 Gen 3, Leica Summilux 50MP.", specs: { chip: "Snapdragon 8 Gen 3", screen: '6.73" AMOLED 2K 120Hz', camera: "50MP Leica + 50MP + 50MP", battery: "4880 mAh", os: "MIUI 15", storage: "256GB" }, prices: [{ source: "Shopee", price: 23490000 }, { source: "Lazada", price: 23990000 }] },
  { name: "Xiaomi 14 256GB", brand: "Xiaomi", model: "Xiaomi 14", storage: "256GB", short: "SD 8 Gen 3, Leica, sạc 90W.", specs: { chip: "Snapdragon 8 Gen 3", screen: '6.36" AMOLED 120Hz', camera: "50MP Leica + 50MP + 50MP", battery: "4610 mAh", os: "MIUI 15", storage: "256GB" }, prices: [{ source: "Shopee", price: 19990000 }, { source: "Lazada", price: 20490000 }] },
  { name: "Xiaomi 13T Pro 256GB", brand: "Xiaomi", model: "Xiaomi 13T Pro", storage: "256GB", short: "Dimensity 9200+, Leica, sạc 120W.", specs: { chip: "Dimensity 9200+", screen: '6.67" AMOLED 144Hz', camera: "50MP Leica + 50MP + 12MP", battery: "5000 mAh", os: "MIUI 14", storage: "256GB" }, prices: [{ source: "Shopee", price: 14990000 }, { source: "Lazada", price: 15490000 }] },
  { name: "Xiaomi 13T 256GB", brand: "Xiaomi", model: "Xiaomi 13T", storage: "256GB", short: "Dimensity 8200 Ultra, Leica, 144Hz.", specs: { chip: "Dimensity 8200 Ultra", screen: '6.67" AMOLED 144Hz', camera: "50MP Leica + 8MP + 2MP", battery: "5000 mAh", os: "MIUI 14", storage: "256GB" }, prices: [{ source: "Shopee", price: 10990000 }] },
  { name: "Redmi Note 13 Pro+ 256GB", brand: "Xiaomi", model: "Redmi Note 13 Pro+", storage: "256GB", short: "Dimensity 7200 Ultra, 200MP, 120W.", specs: { chip: "Dimensity 7200 Ultra", screen: '6.67" AMOLED 1.5K 120Hz', camera: "200MP + 8MP + 2MP", battery: "5000 mAh", os: "MIUI 14", storage: "256GB" }, prices: [{ source: "Shopee", price: 7990000 }, { source: "Lazada", price: 8290000 }] },
  { name: "Redmi Note 13 Pro 256GB", brand: "Xiaomi", model: "Redmi Note 13 Pro", storage: "256GB", short: "SD 7s Gen 2, 200MP, sạc 67W.", specs: { chip: "Snapdragon 7s Gen 2", screen: '6.67" AMOLED 1.5K 120Hz', camera: "200MP + 8MP + 2MP", battery: "5100 mAh", os: "MIUI 14", storage: "256GB" }, prices: [{ source: "Shopee", price: 6790000 }, { source: "Lazada", price: 7090000 }] },
  { name: "Redmi Note 13 128GB", brand: "Xiaomi", model: "Redmi Note 13", storage: "128GB", short: "SD 685, AMOLED 90Hz, 108MP.", specs: { chip: "Snapdragon 685", screen: '6.67" AMOLED 90Hz', camera: "108MP + 8MP + 2MP", battery: "5000 mAh", os: "MIUI 14", storage: "128GB" }, prices: [{ source: "Shopee", price: 4490000 }, { source: "Lazada", price: 4690000 }] },
  { name: "Redmi Note 12 Pro 128GB", brand: "Xiaomi", model: "Redmi Note 12 Pro", storage: "128GB", short: "Dimensity 1080, IMX766 50MP.", specs: { chip: "Dimensity 1080", screen: '6.67" AMOLED 120Hz', camera: "50MP IMX766 + 8MP + 2MP", battery: "5000 mAh", os: "MIUI 14", storage: "128GB" }, prices: [{ source: "Shopee", price: 5990000 }] },
  { name: "Redmi Note 12 128GB", brand: "Xiaomi", model: "Redmi Note 12", storage: "128GB", short: "SD 685, AMOLED 90Hz, giá tốt.", specs: { chip: "Snapdragon 685", screen: '6.67" AMOLED 90Hz', camera: "50MP + 8MP + 2MP", battery: "5000 mAh", os: "MIUI 14", storage: "128GB" }, prices: [{ source: "Shopee", price: 4490000 }, { source: "Lazada", price: 4690000 }] },
  { name: "Poco X6 Pro 256GB", brand: "Xiaomi", model: "Poco X6 Pro", storage: "256GB", short: "Dimensity 8300 Ultra, 1.5K 120Hz.", specs: { chip: "Dimensity 8300 Ultra", screen: '6.67" AMOLED 1.5K 120Hz', camera: "64MP + 8MP + 2MP", battery: "5000 mAh", os: "MIUI 14", storage: "256GB" }, prices: [{ source: "Shopee", price: 7990000 }, { source: "Lazada", price: 8290000 }] },
  { name: "Poco M6 Pro 256GB", brand: "Xiaomi", model: "Poco M6 Pro", storage: "256GB", short: "Helio G99 Ultra, giá tốt.", specs: { chip: "Helio G99 Ultra", screen: '6.67" LCD 90Hz', camera: "64MP + 8MP + 2MP", battery: "5000 mAh", os: "MIUI 14", storage: "256GB" }, prices: [{ source: "Shopee", price: 4590000 }, { source: "Lazada", price: 4890000 }] },
];

async function main() {
  console.log("Starting seed...");
  let created = 0, skipped = 0;

  for (const p of phones) {
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
          prices: { create: p.prices.map(pr => ({ source: pr.source, price: pr.price })) },
        },
      });

      // Generate 30 days of price history
      const baseDate = new Date(); baseDate.setDate(baseDate.getDate() - 29); baseDate.setHours(0,0,0,0);
      const basePrice = p.prices[0].price;
      let running = basePrice;

      for (let day = 0; day < 30; day++) {
        const d = new Date(baseDate); d.setDate(baseDate.getDate() + day);
        const drift = (Math.random() - 0.48) * 800000;
        running = Math.max(running * 0.995 + drift, running * 0.97);
        const daily = p.prices.map(s => Math.round(s.price + (Math.random() - 0.5) * 600000));
        const avg = Math.round(daily.reduce((a,b) => a+b, 0) / daily.length);
        await prisma.priceHistory.upsert({
          where: { productId_date: { productId: product.id, date: d } } as never,
          update: { avgPrice: avg, minPrice: Math.min(...daily), maxPrice: Math.max(...daily) },
          create: { productId: product.id, date: d, avgPrice: avg, minPrice: Math.min(...daily), maxPrice: Math.max(...daily) },
        });
      }

      console.log(`  OK: ${p.name}`);
      created++;
    } catch (err) {
      console.error(`  FAIL: ${p.name}:`, (err as Error).message);
      skipped++;
    }
  }
  console.log(`Done: ${created} created, ${skipped} skipped`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());


