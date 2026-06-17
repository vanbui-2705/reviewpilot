// ── Types ─────────────────────────────────────────────────────────

export type Marketplace = "Shopee" | "Lazada" | "Tiki";

export type Platform = "youtube" | "tiktok" | "facebook" | "instagram";

// ── Backward-compatible stubs for admin/dashboard pages ────────────
export const tools: any[] = [];
export const seoArticles: any[] = [];
export const orders: any[] = [];
export const pricingPlans: any[] = [];
export const reviewAlerts: any[] = [];

export type ProductOffer = {
  marketplace: Marketplace;
  shopName: string;
  price: number;
  oldPrice?: number;
  rating: number;
  sold: number;
  condition: "Cũ đẹp" | "Like new" | "99%" | "Mới";
  affiliateUrl: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  storage: string;
  condition: string;
  imageUrl: string;
  shortDescription: string;
  specs: Record<string, string>;
  offers: ProductOffer[];
  priceHistory: Array<{ date: string; price: number }>;
  faqs: Array<{ question: string; answer: string }>;
  status: string;
  // backward-compat alias for admin pages using old `image` field
  image?: string;
};

export type ProductCardItem = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  storage: string;
  imageUrl: string;
  shortDescription: string;
  specs: Record<string, string>;
  lowestPrice: number;
  offerCount: number;
  createdAt: Date;
  updatedAt: Date;
};

// ── Formatters ────────────────────────────────────────────────────

export function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getLowestOffer(product: Product) {
  if (!product.offers || product.offers.length === 0) {
    return {
      marketplace: "Shopee" as Marketplace,
      shopName: "N/A",
      price: 0,
      oldPrice: 0,
      rating: 0,
      sold: 0,
      condition: "Mới" as const,
      affiliateUrl: "#",
    };
  }
  return [...product.offers].sort((a, b) => a.price - b.price)[0];
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
