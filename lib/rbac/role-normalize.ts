import { type Role } from "./roles";

// Prisma schema uses uppercase, RBAC uses lowercase
// Prisma: "SHOP_OWNER" | "ADMIN" | "FREE_USER" (or any string)
// RBAC:  "shop" | "admin" | "free"

export function normalizeRole(dbRole: string): Role {
  const normalized = dbRole.toLowerCase().replace(/\s+/g, "_");
  if (normalized === "shop" || normalized === "shop_owner") return "shop";
  if (normalized === "admin") return "admin";
  return "free";
}
