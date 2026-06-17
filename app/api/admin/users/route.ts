import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac/session";
import { type Role } from "@/lib/rbac/roles";

let users: { id: string; name: string; email: string; role: Role; shopId?: string; status: string; createdAt: string }[] = [
  { id: "1", name: "Admin ReviewPilot", email: "admin@reviewpilot.vn", role: "admin", status: "Active", createdAt: "2024-01-01" },
  { id: "2", name: "Chủ Shop A", email: "shop@reviewpilot.vn", role: "shop", shopId: "shop-001", status: "Active", createdAt: "2024-01-10" },
  { id: "3", name: "Người dùng thử", email: "free@reviewpilot.vn", role: "free", status: "Trial", createdAt: "2024-01-15" },
  { id: "4", name: "Chủ Shop B", email: "shop2@reviewpilot.vn", role: "shop", shopId: "shop-002", status: "Active", createdAt: "2024-01-12" },
  { id: "5", name: "User đã hết trial", email: "free2@reviewpilot.vn", role: "free", status: "Expired", createdAt: "2024-01-05" },
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
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  const { name, email, role, shopId } = body as { name: string; email: string; role: Role; shopId?: string };
  if (!name || !email || !role) return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });

  const newUser = {
    id: String(Date.now()),
    name,
    email,
    role,
    shopId,
    status: role === "free" ? "Trial" : "Active",
    createdAt: new Date().toISOString().split("T")[0],
  };
  users.push(newUser);
  return NextResponse.json({ user: newUser }, { status: 201 });
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  const { id, role, status, shopId } = body as { id: string; role?: Role; status?: string; shopId?: string };
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });

  if (role) users[idx].role = role;
  if (status) users[idx].status = status;
  if (shopId !== undefined) users[idx].shopId = shopId;
  return NextResponse.json({ user: users[idx] });
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  users = users.filter((u) => u.id !== id);
  return NextResponse.json({ ok: true });
}
