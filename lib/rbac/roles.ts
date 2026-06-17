export type Role = "free" | "shop" | "admin";

export type Permission =
  | "video:download"
  | "crawl:try"
  | "crawl:unlimited"
  | "review:monitor"
  | "orders:view"
  | "competitors:track"
  | "inventory:manage"
  | "ai:tools"
  | "users:manage"
  | "shops:manage"
  | "system:config";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  free: ["video:download", "crawl:try"],
  shop: [
    "video:download",
    "crawl:unlimited",
    "review:monitor",
    "orders:view",
    "competitors:track",
    "inventory:manage",
    "ai:tools",
  ],
  admin: [
    "video:download",
    "crawl:unlimited",
    "review:monitor",
    "orders:view",
    "competitors:track",
    "inventory:manage",
    "ai:tools",
    "users:manage",
    "shops:manage",
    "system:config",
  ],
};

export const ROLE_LABELS: Record<Role, string> = {
  free: "Dùng thử",
  shop: "Shop trả phí",
  admin: "Admin",
};

export const ROLE_ORDER: Role[] = ["free", "shop", "admin"];

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function canAccessRoute(role: Role, path: string): boolean {
  if (path.startsWith("/try")) return true;
  if (path.startsWith("/tools") || path.startsWith("/download")) return hasPermission(role, "video:download");
  if (path.startsWith("/search") || path.startsWith("/crawl")) return hasAnyPermission(role, ["crawl:try", "crawl:unlimited"]);
  if (path.startsWith("/dashboard/reviews")) return hasPermission(role, "review:monitor");
  if (path.startsWith("/dashboard/orders")) return hasPermission(role, "orders:view");
  if (path.startsWith("/dashboard/competitors")) return hasPermission(role, "competitors:track");
  if (path.startsWith("/dashboard/inventory")) return hasPermission(role, "inventory:manage");
  if (path.startsWith("/dashboard/ai-tools")) return hasPermission(role, "ai:tools");
  if (path.startsWith("/dashboard")) return role !== "free";
  if (path.startsWith("/admin")) return role === "admin";
  return true;
}
