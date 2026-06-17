import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac/session";

const shops = [
  { id: "shop-001", name: "Shop Dien Thoai A", owner: "shop@reviewpilot.vn", plan: "Pro", status: "Active", revenue: "12.4tr", crawls: 342 },
  { id: "shop-002", name: "Shop Phu Kien B", owner: "shop2@reviewpilot.vn", plan: "Starter", status: "Active", revenue: "5.8tr", crawls: 128 },
];

async function requireAdmin() {
  try {
    await requireRole("admin");
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Forbidden" : "Unauthorized" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ shops });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  const { name, ownerEmail, plan } = body as { name: string; ownerEmail: string; plan: string };
  if (!name || !ownerEmail) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const newShop = {
    id: `shop-${String(Date.now()).slice(-6)}`,
    name,
    owner: ownerEmail,
    plan: plan || "Starter",
    status: "Active",
    revenue: "0d",
    crawls: 0,
  };
  shops.push(newShop);
  return NextResponse.json({ shop: newShop }, { status: 201 });
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  const { id, status, plan } = body as { id: string; status?: string; plan?: string };
  const idx = shops.findIndex((s) => s.id === id);
  if (idx === -1) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  if (status) shops[idx].status = status;
  if (plan) shops[idx].plan = plan;
  return NextResponse.json({ shop: shops[idx] });
}
