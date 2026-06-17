import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// API route to simulate crawl price updates (called by cron)
// Creates one Price row per marketplace source (Shopee, Lazada, Tiki)
export async function GET() {
try {
const products = await db.product.findMany({
include: {
prices: {
where: { source: { in: ['Shopee', 'Lazada', 'Tiki'] } },
orderBy: { scrapedAt: 'desc' },
},
},
});
let updatedCount = 0;
const SOURCES = ['Shopee', 'Lazada', 'Tiki'] as const;
const BASE_PRICES: Record<string, number> = {
Shopee: 11500000,
Lazada: 11800000,
Tiki: 12000000,
};

for (const product of products) {
for (const source of SOURCES) {
// Find last price for this specific source
const lastForSource = product.prices.find((p: { source: string; price: number }) => p.source === source);
const base = lastForSource?.price ?? BASE_PRICES[source];

// Simulate +- 2% price variation
const change = base * (Math.random() * 0.04 - 0.02);
const newPrice = Math.round((base + change) / 1000) * 1000;

await db.price.create({
data: { productId: product.id, source, price: newPrice },
});
}
updatedCount++;
}

return NextResponse.json({ success: true, message: `Crawled and updated ${updatedCount} products.` });
} catch (error) {
console.error('Crawl error:', error);
return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
}
}
