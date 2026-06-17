import { db } from "@/lib/db";
import {
getProductCards,
getProductBySlug as fetchProductBySlug,
getRelatedProducts,
createProduct,
addPrice,
getAllBrands,
} from "@/lib/db-services";
import { formatVnd, getLowestOffer, type Product, type ProductOffer, slugify } from "@/lib/data";

// ── Mock data for dev without DB ───────────────────────────────────

const MOCK_PRODUCTS: Product[] = [
{
id: "mock-1",
slug: "iphone-15-pro-max-256gb",
name: "iPhone 15 Pro Max 256GB",
brand: "Apple",
model: "iPhone 15 Pro Max",
storage: "256GB",
condition: "Mới",
imageUrl: "/assets/product-phone.svg",
shortDescription: "Flagship Apple với chip A17 Pro, camera 48MP, titanium design.",
specs: { chip: "A17 Pro", screen: '6.7" Super Retina XDR', camera: "48MP + 12MP + 12MP", battery: "4441 mAh", os: "iOS 17", storage: "256GB" },
offers: [
{ marketplace: "Shopee", shopName: "Shopee Apple Store", price: 33990000, oldPrice: 36990000, rating: 4.9, sold: 5200, condition: "Mới", affiliateUrl: "https://shopee.vn/search?keyword=iphone+15+pro+max" },
{ marketplace: "Lazada", shopName: "Lazada Mall Apple", price: 34490000, oldPrice: 36990000, rating: 4.8, sold: 3100, condition: "Mới", affiliateUrl: "https://lazada.vn/search?keyword=iphone+15+pro+max" },
{ marketplace: "Tiki", shopName: "Tiki Trading", price: 34990000, oldPrice: 36990000, rating: 4.7, sold: 1800, condition: "Mới", affiliateUrl: "https://tiki.vn/search?keyword=iphone+15+pro+max" },
],
priceHistory: Array.from({ length: 30 }, (_, i) => ({
date: `${String(30 - i).padStart(2, "0")}/06`,
price: 34000000 + Math.floor(Math.random() * 2000000 - 500000),
})),
faqs: [{ question: "iPhone 15 Pro Max có chống nước không?", answer: "Có, chuẩn IP68 chịu nước ở độ sâu 6m trong 30 phút." }],
status: "active",
},
{
id: "mock-2",
slug: "iphone-15-pro-128gb",
name: "iPhone 15 Pro 128GB",
brand: "Apple",
model: "iPhone 15 Pro",
storage: "128GB",
condition: "Mới",
imageUrl: "/assets/product-phone.svg",
shortDescription: "Chip A17 Pro, titanium, Dynamic Island. Camera 48MP ProRAW.",
specs: { chip: "A17 Pro", screen: '6.1" Super Retina XDR', camera: "48MP + 12MP + 12MP", battery: "3274 mAh", os: "iOS 17", storage: "128GB" },
offers: [
{ marketplace: "Shopee", shopName: "Shopee Apple Store", price: 28990000, oldPrice: 31990000, rating: 4.9, sold: 4800, condition: "Mới", affiliateUrl: "https://shopee.vn/search?keyword=iphone+15+pro" },
{ marketplace: "Lazada", shopName: "Lazada Mall Apple", price: 29490000, oldPrice: 31990000, rating: 4.8, sold: 2700, condition: "Mới", affiliateUrl: "https://lazada.vn/search?keyword=iphone+15+pro" },
],
priceHistory: Array.from({ length: 30 }, (_, i) => ({
date: `${String(30 - i).padStart(2, "0")}/06`,
price: 29000000 + Math.floor(Math.random() * 2000000 - 500000),
})),
faqs: [],
status: "active",
},
];

let _mockDb = [...MOCK_PRODUCTS];

function isDbAvailable(): boolean {
try {
return process.env.DATABASE_URL !== undefined &&
process.env.DATABASE_URL !== "" &&
!process.env.DATABASE_URL.startsWith("file:");
} catch {
return false;
}
}

// ── Product Listing ───────────────────────────────────────────────

export async function getProductCardsService({
page = 1,
limit = 20,
search = "",
brand = "",
sort = "newest",
}: {
page?: number;
limit?: number;
search?: string;
brand?: string;
sort?: string;
}): Promise<{ items: Product[]; total: number }> {
if (!isDbAvailable()) {
let filtered = [..._mockDb];
if (search) {
const q = search.toLowerCase();
filtered = filtered.filter(
(p) =>
p.name.toLowerCase().includes(q) ||
p.brand.toLowerCase().includes(q) ||
p.model.toLowerCase().includes(q)
);
}
if (brand) {
filtered = filtered.filter((p) => p.brand === brand);
}
const total = filtered.length;
const start = (page - 1) * limit;
const items = filtered.slice(start, start + limit);
return { items, total };
}
try {
const { items, total } = await getProductCards({ page, limit, search, brand, sort });
const enriched: Product[] = items.map((card) => ({
id: card.id,
slug: card.slug,
name: card.name,
brand: card.brand,
model: card.model,
storage: card.storage,
condition: "Mới",
imageUrl: card.imageUrl,
shortDescription: card.shortDescription,
specs: card.specs,
offers: [
{
marketplace: "Shopee" as const,
shopName: "Shopee Top Store",
price: card.lowestPrice,
rating: 4.6,
sold: 500,
condition: "Mới" as const,
affiliateUrl: `https://shopee.vn/search?keyword=${encodeURIComponent(card.slug)}`,
},
],
priceHistory: [],
faqs: [],
status: "active",
}));
return { items: enriched, total };
} catch {
let filtered = [..._mockDb];
if (search) {
const q = search.toLowerCase();
filtered = filtered.filter(
(p) =>
p.name.toLowerCase().includes(q) ||
p.brand.toLowerCase().includes(q) ||
p.model.toLowerCase().includes(q)
);
}
if (brand) {
filtered = filtered.filter((p) => p.brand === brand);
}
const total = filtered.length;
const start = (page - 1) * limit;
const items = filtered.slice(start, start + limit);
return { items, total };
}
}

export async function getProductBySlugService(slug: string): Promise<Product | null> {
if (!isDbAvailable()) {
const dbProduct = await fetchProductBySlug(slug);
if (dbProduct) return dbProduct;
return _mockDb.find((p) => p.slug === slug) || null;
}
try {
const product = await fetchProductBySlug(slug);
if (product) return product;
} catch {}
try {
const raw = await db.product.findUnique({
where: { slug },
include: {
prices: { orderBy: { scrapedAt: "desc" }, take: 20 },
},
});
if (!raw) return null;
const latestBySource = new Map<string, (typeof raw.prices)[number]>();
for (const pr of raw.prices) {
const existing = latestBySource.get(pr.source);
if (!existing || pr.scrapedAt > existing.scrapedAt) {
latestBySource.set(pr.source, pr);
}
}
const offers: ProductOffer[] = Array.from(latestBySource.entries()).map(
([source, pr]) => ({
marketplace: source as ProductOffer["marketplace"],
shopName: `${source} Store`,
price: pr.price,
oldPrice: pr.price + Math.floor(Math.random() * 500000) + 100000,
rating: 4.5 + Math.random() * 0.5,
sold: Math.floor(Math.random() * 2000) + 200,
condition: "Mới" as const,
affiliateUrl: pr.url || "#",
})
);
return {
id: raw.id,
slug: raw.slug,
name: raw.name,
brand: raw.brand,
model: raw.model || "",
storage: (raw.specs as Record<string, string> | null)?.storage || "128GB",
condition: "Mới",
imageUrl: raw.imageUrl || "/assets/product-phone.svg",
shortDescription: raw.shortDescription || "",
specs: (raw.specs as Record<string, string>) || {},
offers,
priceHistory: [],
faqs: [],
status: raw.status,
};
} catch {
return _mockDb.find((p) => p.slug === slug) || null;
}
}

export async function getRelatedProductsService(
currentSlug: string,
limit = 3
): Promise<Product[]> {
if (!isDbAvailable()) {
const current = _mockDb.find((p) => p.slug === currentSlug);
if (!current) return [];
return _mockDb
.filter((p) => p.brand === current.brand && p.slug !== currentSlug)
.slice(0, limit);
}
try {
return getRelatedProducts(currentSlug, limit);
} catch {
const current = _mockDb.find((p) => p.slug === currentSlug);
if (!current) return [];
return _mockDb
.filter((p) => p.brand === current.brand && p.slug !== currentSlug)
.slice(0, limit);
}
}

// ── Admin CRUD ────────────────────────────────────────────────────

export async function createProductService(data: {
name: string;
brand: string;
model?: string;
imageUrl?: string;
shortDescription?: string;
specs?: Record<string, string>;
}) {
if (!isDbAvailable()) {
const product: Product = {
id: `mock-${Date.now()}`,
slug: slugify(data.name),
name: data.name,
brand: data.brand,
model: data.model || "",
storage: (data.specs as Record<string, string> | undefined)?.storage || "128GB",
condition: "Mới",
imageUrl: data.imageUrl || "/assets/product-phone.svg",
shortDescription: data.shortDescription || "",
specs: data.specs || {},
offers: [],
priceHistory: [],
faqs: [],
status: "active",
};
_mockDb.push(product);
return product;
}
return createProduct(data);
}

export async function addPriceService(data: {
productId: string;
source: string;
price: number;
url?: string;
}) {
if (!isDbAvailable()) return null;
try {
return addPrice(data);
} catch {
return null;
}
}

export async function getAllBrandsService(): Promise<string[]> {
if (!isDbAvailable()) {
return [...new Set(_mockDb.map((p) => p.brand))].sort();
}
try {
return getAllBrands();
} catch {
return [...new Set(_mockDb.map((p) => p.brand))].sort();
}
}

// ── Backward-compatible wrapper for admin page ─────────────────────
// Returns products in the old flat shape expected by admin/pages
export async function getProducts() {
const { items } = await getProductCardsService({
page: 1,
limit: 200,
search: "",
brand: "",
sort: "newest",
});
return items;
}
