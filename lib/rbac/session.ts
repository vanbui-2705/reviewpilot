import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyAccessToken, type JWTPayload } from "@/lib/jwt";
import { type Role, ROLE_PERMISSIONS, type Permission, hasPermission, hasAnyPermission } from "./roles";
import { normalizeRole } from "./role-normalize";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  shopId?: string;
}

const ACCESS_COOKIE = "rp_access_token";

function extractToken(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("Bearer ")) {
    return trimmed.slice(7);
  }
  return trimmed;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(ACCESS_COOKIE)?.value;
    const token = extractToken(raw);
    if (!token) return null;

    const payload = await verifyAccessToken(token);

    // Verify user still exists and is active in DB
    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        shops: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!user || user.status !== "active") return null;

    return {
      id: user.id,
      name: user.name ?? "",
      email: user.email ?? "",
      role: normalizeRole(user.role),
      shopId: user.shops[0]?.id ?? undefined,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== role) throw new Error("FORBIDDEN");
  return user;
}

export function canAccess(role: Role, permission: Permission): boolean {
  return hasPermission(role, permission);
}

export function hasAny(role: Role, permissions: Permission[]): boolean {
  return hasAnyPermission(role, permissions);
}
