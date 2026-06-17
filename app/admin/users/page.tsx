"use client";

import { useAuth } from "@/components/auth-context";
import { useCallback, useEffect, useRef, useState } from "react";

type Role = "free" | "shop" | "admin";
type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  shopId?: string;
  active: boolean;
  trialCrawlsLeft?: number;
  createdAt?: string;
};

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "free" as Role, trialCrawlsLeft: 2, shopId: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Load failed");
      setUsers(data.users ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", role: "free", trialCrawlsLeft: 2, shopId: "" });
    setShowForm(false);
    setEditId(null);
  };

  const startEdit = (u: UserRow) => {
    setEditId(u.id);
    setForm({ name: u.name, email: u.email, password: "", role: u.role, trialCrawlsLeft: u.trialCrawlsLeft ?? 0, shopId: u.shopId ?? "" });
    setShowForm(true);
  };

  const saveUser = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const body: any = { name: form.name.trim(), email: form.email.trim(), role: form.role };
      if (form.password.trim()) body.password = form.password.trim();
      if (editId) {
        body.trialCrawlsLeft = form.trialCrawlsLeft;
        if (form.shopId.trim()) body.shopId = form.shopId.trim();
        else body.shopId = null;
        const res = await fetch(`/api/admin/users?id=${editId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setUsers((u) => u.map((x) => (x.id === editId ? { ...x, ...data.user } : x)));
      } else {
        body.trialCrawlsLeft = form.trialCrawlsLeft;
        body.active = true;
        const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setUsers((u) => [...u, data.user]);
      }
      resetForm();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  };

  const patchUser = async (id: string, patch: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers((u) => u.map((x) => (x.id === id ? { ...x, ...data.user } : x)));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Xóa người dùng này? Hành động không thể hoàn tác.")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers((u) => u.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-8 text-center text-muted">
        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-shopee border-t-transparent mr-2" />
        Đang tải danh sách...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Quản lý người dùng</h1>
          <p className="text-sm text-muted">Tạo, cấp quyền và quản lý tài khoản.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary inline-flex items-center gap-2"
        >
          + Thêm người dùng
        </button>
      </div>

      {error && (
        <div className="card border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {showForm && (
        <div className="card space-y-3 border-shopee/30 bg-soft/50">
          <div className="text-sm font-extrabold text-ink">{editId ? "Chỉnh sửa người dùng" : "Tạo người dùng mới"}</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-muted">Tên hiển thị</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input mt-1"
                placeholder="Nguyễn Văn A"
                ref={nameRef}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input mt-1"
                placeholder="user@reviewpilot.vn"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted">Mật khẩu {editId ? "(để trống nếu không đổi)" : ""}</label>
              <input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input mt-1"
                placeholder="••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted">Vai trò</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                className="input mt-1"
              >
                <option value="free">Miễn phí (Free)</option>
                <option value="shop">Shop (trả phí)</option>
                <option value="admin">Quản trị (Admin)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted">Lần thử crawl còn lại</label>
              <input
                type="number"
                min={0}
                value={form.trialCrawlsLeft}
                onChange={(e) => setForm({ ...form, trialCrawlsLeft: parseInt(e.target.value) || 0 })}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted">Shop ID</label>
              <input
                value={form.shopId}
                onChange={(e) => setForm({ ...form, shopId: e.target.value })}
                className="input mt-1"
                placeholder="shop-001 (tùy chọn)"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveUser} disabled={saving} className="btn-primary">
              {saving ? "Đang lưu..." : editId ? "Cập nhật" : "Tạo tài khoản"}
            </button>
            <button onClick={resetForm} disabled={saving} className="btn-outline">Hủy</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th className="p-3 font-bold">Người dùng</th>
              <th className="p-3 font-bold">Email</th>
              <th className="p-3 font-bold">Vai trò</th>
              <th className="p-3 font-bold">Shop ID</th>
              <th className="p-3 font-bold">Thử</th>
              <th className="p-3 font-bold">Trạng thái</th>
              <th className="p-3 font-bold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line/60 last:border-0 hover:bg-soft/40">
                <td className="p-3">
                  <div className="font-semibold text-ink">{u.name}</div>
                  <div className="text-xs text-muted">ID: {u.id.slice(0, 8)}...</div>
                </td>
                <td className="p-3 text-muted">{u.email}</td>
                <td className="p-3">
                  <select
                    value={u.role}
                    disabled={saving || u.id === me?.id}
                    onChange={(e) => patchUser(u.id, { role: e.target.value })}
                    className="bg-transparent border border-line rounded px-2 py-1.5 text-xs font-bold"
                  >
                    <option value="free">Miễn phí</option>
                    <option value="shop">Shop</option>
                    <option value="admin">Quản trị</option>
                  </select>
                </td>
                <td className="p-3 text-muted font-mono text-xs">{u.shopId || "—"}</td>
                <td className="p-3 text-center">
                  <span className={`font-extrabold ${(u.trialCrawlsLeft ?? 0) === 0 ? "text-red-600" : "text-ink"}`}>
                    {u.trialCrawlsLeft ?? "∞"}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => patchUser(u.id, { active: !u.active })}
                    disabled={saving || u.id === me?.id}
                    className={`badge cursor-pointer ${u.active ? "bg-leaf/15 text-leaf" : "bg-ink/10 text-muted"}`}
                  >
                    {u.active ? "✓ Hoạt động" : "✕ Đã khóa"}
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => startEdit(u)}
                      disabled={saving || u.id === me?.id}
                      className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-bold text-muted hover:text-ink hover:bg-soft"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      disabled={saving || u.id === me?.id}
                      className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted">
                  Chưa có người dùng nào. Click <b>+ Thêm người dùng</b> để tạo tài khoản đầu tiên.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
