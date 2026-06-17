// Make dynamic to avoid Prisma init at build time
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { listShops, getCrawlLogs } from "@/lib/shopee/service";

export default async function AdminShopsPage() {
let shops: any[] = [];
let logs: any[] = [];
try {
const result = await Promise.all([
listShops().catch(() => []),
getCrawlLogs(undefined, 50).catch(() => []),
]);
shops = result[0];
logs = result[1];
} catch { /* skip during build */ }

const latestLogByShop = new Map<string, any>();
logs.forEach((l: any) => {
if (!latestLogByShop.has(l.shopId)) latestLogByShop.set(l.shopId, l);
});

const stats = {
total: shops.length,
active: shops.filter((s: any) => s.status === "active").length,
trial: shops.filter((s: any) => s.plan === "starter").length,
};

return (
<div className="space-y-6">
<section className="rounded-lg border border-line bg-white p-6 shadow-sm">
<div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
<div>
<p className="font-extrabold uppercase tracking-wide text-shopee">Admin console</p>
<h1 className="mt-2 text-3xl font-extrabold">Quan ly shops tra phi</h1>
<p className="mt-2 text-sm text-muted">
Theo doi shop, chu so huu, goi subscription, quota crawl.
</p>
</div>
</div>
</section>

<section className="grid gap-4 md:grid-cols-3">
{[


{ label: "Tổng shop", value: String(stats.total), icon: "Store" },
{ label: "Đang hoạt động", value: String(stats.active), icon: "CreditCard" },
{ label: "Starter / Trial", value: String(stats.trial), icon: "Users" },
].map((s: any) => (
<div key={s.label} className="card p-5">
<div className="text-sm font-bold text-muted">{s.label}</div>
<div className="mt-2 text-3xl font-extrabold">{s.value}</div>
</div>
))}
</section>

<section className="card overflow-hidden p-0">
<div className="border-b border-line p-5">
<h2 className="text-lg font-extrabold">Danh sach shop</h2>
</div>
<div className="overflow-x-auto">
<table className="w-full min-w-[860px] text-sm">
<thead>
<tr className="border-b border-line bg-soft/60 text-left text-muted">
<th className="px-5 py-3 font-bold">Shop</th>
<th className="px-5 py-3 font-bold">Plan</th>
<th className="px-5 py-3 font-bold">Status</th>
<th className="px-5 py-3 font-bold">Quota</th>
<th className="px-5 py-3 font-bold">Last crawl</th>
<th className="px-5 py-3 font-bold">Last result</th>
<th className="px-5 py-3 text-right font-bold">Action</th>
</tr>
</thead>
<tbody>
{shops.length === 0 ? (
<tr>
<td colSpan={7} className="px-5 py-8 text-center text-muted">
Chưa có shop nào. Tạo shop đầu tiên để bắt đầu.
</td>
</tr>
) : (
shops.map((shop: any) => {
const log = latestLogByShop.get(shop.id);
const pct = Math.round((shop.crawlUsed / shop.monthlyQuota) * 100);
return (
<tr key={shop.id} className="border-b border-line last:border-0 hover:bg-soft/40">
<td className="px-5 py-4">
<div className="font-extrabold">{shop.name}</div>
<div className="text-xs text-muted truncate max-w-[260px]">
{shop.shopeeUrl}
</div>
</td>
<td className="px-5 py-4">
<span className="badge-shopee">{shop.plan}</span>
</td>
<td className="px-5 py-4">
<span className={`badge ${shop.status === "active" ? "badge-ok" : "badge-warn"}`}>
{shop.status}
</span>
</td>
<td className="px-5 py-4">
<div className="w-32">
<div className="flex justify-between text-xs">
<span className="font-bold">{shop.crawlUsed}/{shop.monthlyQuota}</span>
<span className="text-muted">{pct}%</span>
</div>
<div className="mt-1 h-1.5 rounded-full bg-soft overflow-hidden">
<div
className={`h-full rounded-full ${pct > 80 ? "bg-red-500" : "bg-shopee"}`}
style={{ width: `${pct}%` }}
/>
</div>
</div>
</td>
<td className="px-5 py-4 text-xs text-muted">
{shop.lastCrawledAt
? new Date(shop.lastCrawledAt).toLocaleString("vi-VN")
: "Chưa crawl"}
</td>
<td className="px-5 py-4 text-xs">
{log ? (
<div>
<span
className={`badge ${log.status === "success" ? "badge-ok" : log.status === "failed" ? "badge-err" : "badge-warn"}`}
>
{log.status}
</span>
{log.productsFound > 0 && (
<span className="ml-2 text-muted">
{log.productsFound} sp
</span>
)}
</div>
) : (
<span className="text-muted">-</span>
)}
</td>
<td className="px-5 py-4 text-right">
<CrawlButton shopId={shop.id} shopUrl={shop.shopeeUrl} />
</td>
</tr>
);
})
)}
</tbody>
</table>
</div>
</section>
</div>
);
}

function CrawlButton({ shopId, shopUrl }: { shopId: string; shopUrl: string }) {
return (
<form method="POST" action={`/api/shopee/${shopId}/crawl`}>
<button
className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-extrabold transition-colors hover:border-shopee hover:text-shopee"
title={`Crawl ${shopUrl}`}
>
Crawl
</button>
</form>
);
}
