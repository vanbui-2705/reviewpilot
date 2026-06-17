import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { normalizeRole } from "@/lib/rbac/role-normalize";

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge,
  path: "/",
});

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email và mật khẩu là bắt buộc" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user in DB
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        status: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { error: "Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ." },
        { status: 403 }
      );
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
    }

    // Look up user's shop (if any)
    const shop = await db.shop.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    const role = normalizeRole(user.role);

    // Build JWT payload
    const jwtPayload = {
      sub: user.id,
      email: user.email ?? normalizedEmail,
      role,
      shopId: shop?.id,
    };

    // Sign tokens
    const accessToken = await signAccessToken(jwtPayload);
    const refreshToken = await signRefreshToken(jwtPayload);

    // Set cookies
    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email ?? normalizedEmail,
        name: user.name,
        role,
        shopId: shop?.id ?? undefined,
      },
    });

    response.cookies.set("rp_access_token", accessToken, cookieOptions(30 * 60));   // 30 minutes
    response.cookies.set("rp_refresh_token", refreshToken, cookieOptions(15 * 24 * 60 * 60)); // 15 days

    return response;
  } catch {
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
