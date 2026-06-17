import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({});

async function main() {
console.log('Seeding data...');

await prisma.priceHistory.deleteMany({});
await prisma.price.deleteMany({});
await prisma.product.deleteMany({});

const productsToSeed = [
{
name: "iPhone 15 Pro Max 256GB",
brand: "iPhone",
model: "iPhone 15 Pro Max",
slug: "iphone-15-pro-max-256gb",
imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80",
shortDescription: "Flagship iPhone 15 Pro Max với chip A17 Pro, camera 48MP và USB-C.",
status: "active",
specs: { chip: "Apple A17 Pro", screen: "6.7 inch OLED 120Hz", camera: "48MP + 12MP + 12MP", battery: "4441 mAh", os: "iOS 18", storage: "256GB" },
},
{
name: "iPhone 15 Pro 128GB",
brand: "iPhone",
model: "iPhone 15 Pro",
slug: "iphone-15-pro-128gb",
imageUrl: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=900&q=80",
shortDescription: "iPhone 15 Pro với khung titan, chip A17 Pro và camera tiên tiến.",
status: "active",
specs: { chip: "Apple A17 Pro", screen: "6.1 inch OLED 120Hz", camera: "48MP + 12MP + 12MP", battery: "3274 mAh", os: "iOS 18", storage: "128GB" },
},
{
name: "iPhone 15 128GB",
brand: "iPhone",
model: "iPhone 15",
slug: "iphone-15-128gb",
imageUrl: "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&w=900&q=80",
shortDescription: "iPhone 15 tiêu chuẩn với Dynamic Island, camera 48MP và USB-C.",
status: "active",
specs: { chip: "Apple A16 Bionic", screen: "6.1 inch OLED 60Hz", camera: "48MP + 12MP", battery: "3349 mAh", os: "iOS 18", storage: "128GB" },
},
];

for (const p of productsToSeed) {
const product = await prisma.product.create({
data: {
name: p.name,
brand: p.brand,
model: p.model,
slug: p.slug,
imageUrl: p.imageUrl,
shortDescription: p.shortDescription,
status: p.status,
specs: p.specs,
prices: {
create: [
{ source: "Shopee", price: 25000000 },
{ source: "Lazada", price: 25500000 },
{ source: "Tiki", price: 26000000 },
]
}
}
});
console.log(`Created product: ${product.name}`);
}

console.log('Seed completed successfully!');
}

main()
.catch((e) => {
console.error(e);
process.exit(1);
})
.finally(async () => {
await prisma.$disconnect();
});
