import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reviewpilot.vn";
const now = new Date();

try {
const products = await db.product.findMany({
where: { status: "active" },
select: { slug: true },
orderBy: { createdAt: "desc" },
take: 50,
});

return [
"",
"/affiliate",
"/blog",
"/dashboard",
"/pricing",
"/products",
"/search",
"/compare",
"/deals",
"/price-alerts",
"/dich-vu",
"/billing",
"/about",
"/contact",
"/faq",
"/admin",
...products.map((p) => `/products/${p.slug}`),
"/tools/youtube",
"/tools/tiktok",
].map((path) => ({
url: `${siteUrl}${path}`,
lastModified: now,
changeFrequency: path.startsWith("/products/") ? "weekly" : "daily",
priority: path === "" ? 1 : 0.8,
}));
} catch {
return [
"",
"/affiliate",
"/blog",
"/dashboard",
"/pricing",
"/products",
"/search",
"/compare",
"/deals",
"/price-alerts",
"/dich-vu",
"/billing",
"/about",
"/contact",
"/faq",
"/admin",
"/tools/youtube",
"/tools/tiktok",
].map((path) => ({
url: `${siteUrl}${path}`,
lastModified: now,
changeFrequency: "daily",
priority: path === "" ? 1 : 0.8,
}));
}
}
