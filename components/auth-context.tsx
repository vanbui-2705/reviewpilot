"use client";

import { createContext, useContext, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "free" | "shop" | "admin";
  shopId?: string;
  trialCrawlsLeft?: number;
}

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logout: async () => {},
  refresh: async () => {},
  hasPermission: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { ok: false, error: data.error || "Đăng nhập thất bại" };
        }

        setUser(data.user);
        return { ok: true };
      } catch {
        return { ok: false, error: "Lỗi kết nối" };
      }
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { ok: false, error: data.error || "Đăng ký thất bại" };
        }

        // Auto-login after register
        setUser(data.user);
        return { ok: true };
      } catch {
        return { ok: false, error: "Lỗi kết nối" };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      router.push("/");
    }
  }, [router]);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      const perms: Record<string, string[]> = {
        free: ["video:download", "crawl:try"],
        shop: ["video:download", "crawl:unlimited", "review:monitor", "orders:view", "competitors:track", "inventory:manage", "ai:tools"],
        admin: ["video:download", "crawl:unlimited", "review:monitor", "orders:view", "competitors:track", "inventory:manage", "ai:tools", "users:manage", "shops:manage", "system:config"],
      };
      return (perms[user.role] ?? []).includes(permission);
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
