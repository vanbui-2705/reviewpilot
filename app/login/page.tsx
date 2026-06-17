"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đăng nhập thất bại");
        return;
      }
      if (data.user.role === "admin") router.push("/admin");
      else if (data.user.role === "shop") router.push("/dashboard");
      else router.push("/try");
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-soft px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-extrabold text-ink"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-shopee text-white">
              R
            </span>
            ReviewPilot
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold">Đăng nhập</h1>
          <p className="mt-2 text-sm text-muted">
            Truy cập dashboard theo vai trò của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="rounded-ui border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-bold text-muted">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="focus-ring w-full rounded-ui border border-line bg-white px-4 py-3 text-sm outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-muted">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="focus-ring w-full rounded-ui border border-line bg-white px-4 py-3 text-sm outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <div className="border-t border-line pt-4">
            <p className="mb-3 text-xs font-bold text-muted">
              Tài khoản mặc định:
            </p>
            <div className="grid gap-2">
              {[
                {
                  role: "Admin",
                  email: "admin@reviewpilot.vn",
                  pw: "Admin@123456",
                  color: "bg-purple-50 text-purple-700 border-purple-200",
                },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.pw);
                  }}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm font-bold transition-colors hover:border-ink/30 ${acc.color}`}
                >
                  <span>{acc.role}</span>
                  <span className="text-xs font-normal opacity-70">
                    {acc.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="font-bold text-shopee hover:underline">
            ← Về trang chủ
          </Link>
        </p>
      </div>
    </main>
  );
}
