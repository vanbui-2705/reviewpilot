# ReviewPilot

## Build requirements

Xem checklist setup/build tai `BUILD_REQUIREMENTS.md`.

Nền tảng quản lý và theo dõi sản phẩm Shopee — crawl dữ liệu thực, dashboard, admin console.

## Stack

- **Framework**: Next.js 14 (App Router) + React 18
- **DB**: Prisma ORM + SQLite (`prisma/dev.db`)
- **Crawler**: Playwright (headless Chromium) — chạy qua `child_process` để tránh webpack bundle
- **UI**: Tailwind CSS 3 + Lucide icons
- **Lang**: TypeScript 5
- **Auth**: RBAC (3 role: free, shop, admin)

## Chạy local

```bash
# install deps
npm install

# generate prisma client
npx prisma generate

# seed database (3 shops + 9 products demo)
npx tsx prisma/seed.ts

# dev
npm run dev        # → http://localhost:3000
```

## Cấu trúc thư mục

```
app/
├── admin/          # Admin console (shops, users, products, articles, orders, settings)
├── dashboard/      # User dashboard (reviews, orders, inventory, ai-tools, competitors)
├── products/       # Product listing + detail page
├── search/         # Tìm kiếm sản phẩm Shopee
├── tools/          # Social media tools (youtube, tiktok, facebook, instagram)
├── api/            # API routes
│   ├── shopee/     # Shop management + crawl trigger
│   ├── leads/      # Lead capture
│   └── affiliate/  # Affiliate click tracking
├── login/          # Đăng nhập
└── page.tsx        # Trang chủ

lib/
├── shopee/
│   ├── service.ts  # Business logic: CRUD shops, crawl pipeline, save products
│   └── demo-data.ts # Demo data seeding
├── db.ts           # Prisma client singleton
└── seo.ts          # SEO metadata helpers

prisma/
├── schema.prisma   # Schema: User, Shop, ShopeeProduct, CrawlLog, ...
└── seed.ts         # Seed shops + demo products

scripts/
├── crawl-shop.ts   # Playwright crawler (chạy độc lập, không webpack)
└── debug-shopee.ts # Debug Shopee DOM
```

## RBAC Roles

| Role    | Mô tả                          |
|---------|-------------------------------|
| `free`  | User thường — xem sản phẩm, tìm kiếm |
| `shop`  | Chủ shop — crawl sản phẩm, quản lý shop của mình |
| `admin` | Toàn quyền — quản lý users, shops, products, crawl logs |

## API Routes

```
GET  /api/shopee              # List shops (no q) / Search Shopee (with q)
POST /api/shopee              # Create shop
PATCH /api/shopee/[id]        # Update shop
DELETE /api/shopee/[id]       # Delete shop
POST /api/shopee/[id]/crawl   # Trigger crawl shop → Playwright → save DB
GET  /api/shopee/[id]/crawl   # List products của shop
GET  /api/shopee/[id]/logs    # Crawl logs của shop
GET  /api/products            # List products (filter by shopId, search, pagination)
POST /api/leads               # Submit lead form
POST /api/affiliate/click     # Track affiliate click
```

## Crawl Pipeline

```
User click "Crawl" trong Admin → POST /api/shopee/[id]/crawl
  → lấy shop URL từ DB
  → spawn scripts/crawl-shop.ts qua child_process (tránh webpack)
  → Playwright mở Chromium headless, navigate đến shop URL
  → extract product cards từ DOM
  → saveCrawlResults(): upsert vào ShopeeProduct table
  → update shop.crawlUsed, shop.lastCrawledAt
  → log CrawlLog (success / failed / partial)
```

## Database Models

```
User ──┐
       ├── Shop (FK userId)
       │      ├── ShopeeProduct (FK shopId)
       │      └── CrawlLog (FK shopId)
```

| Model            | Mô tả                        |
|------------------|------------------------------|
| `User`           | Tài khoản, role, quota       |
| `Shop`           | Shop Shopee, plan, quota     |
| `ShopeeProduct`  | Sản phẩm crawl được          |
| `CrawlLog`       | Log mỗi lần crawl            |

## Scripts hữu ích

```bash
npx tsx scripts/crawl-shop.ts "https://shopee.vn/shop/3503509"  # crawl 1 shop
npx tsx prisma/seed.ts                                          # seed database
npx prisma studio                                               # xem DB
```

## Env

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # internal API base cho service.ts
```
