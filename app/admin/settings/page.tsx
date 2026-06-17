import { Database, KeyRound, Shield, Webhook } from "lucide-react";

const settings = [
  { icon: Database, title: "Database", desc: "Chưa nối PostgreSQL/Supabase. Hiện đang dùng seed data trong code.", status: "Cần làm" },
  { icon: KeyRound, title: "Auth & RBAC", desc: "Cần NextAuth, Google/Zalo OAuth, role Admin/Subscriber/Free.", status: "Cần làm" },
  { icon: Webhook, title: "Payment webhook", desc: "Mock checkout chưa có MoMo, VietQR, Stripe webhook.", status: "Mock" },
  { icon: Shield, title: "Security", desc: "Cần rate limit, CSP header, audit log và backup policy.", status: "Cần làm" },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-extrabold uppercase tracking-wide text-shopee">Settings</p>
        <h1 className="mt-2 text-3xl font-extrabold">Cấu hình hệ thống</h1>
        <p className="mt-1 text-sm text-muted">Danh sách cấu hình cần có trước khi đưa admin vào production.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settings.map((item) => (
          <section key={item.title} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-orange-50 text-shopee">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="badge-shopee">{item.status}</span>
            </div>
            <h2 className="mt-4 text-lg font-extrabold">{item.title}</h2>
            <p className="mt-2 text-sm text-muted">{item.desc}</p>
            <button className="mt-5 rounded-lg border border-line px-4 py-2 text-sm font-extrabold hover:bg-soft">
              Mở cấu hình
            </button>
          </section>
        ))}
      </div>

      <section className="card p-5">
        <h2 className="text-lg font-extrabold">Environment checklist</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["NEXT_PUBLIC_SITE_URL", "DATABASE_URL", "NEXTAUTH_SECRET", "MOMO_SECRET", "ZALO_OA_TOKEN", "SENTRY_DSN"].map((key) => (
            <div key={key} className="rounded-lg border border-line p-3">
              <div className="text-xs font-bold text-muted">ENV</div>
              <div className="mt-1 truncate font-extrabold">{key}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
