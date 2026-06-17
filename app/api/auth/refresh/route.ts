import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const rawRefreshToken = cookieStore.get("rp_refresh_token")?.value;

    if (!rawRefreshToken) {
      return NextResponse.json({ error: "Không có refresh token" }, { status: 401 });
    }

    // Verify refresh token signature + expiry + type
    const payload = await verifyRefreshToken(rawRefreshToken);

    // Check user still exists and is active
    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, status: true },
    });

    if (!user || user.status !== "active") {
      return NextResponse.json({ error: "Tài khoản không hợp lệ" }, { status: 401 });
    }

    // Issue new access token + new refresh token (rotation)
    const jwtPayload = {
      sub: user.id,
      email: payload.email,
      role: payload.role,
      shopId: payload.shopId,
    };

    const newAccessToken = await signAccessToken(jwtPayload);
    const newRefreshToken = await signRefreshToken(jwtPayload);

    const response = NextResponse.json({ ok: true });

    response.cookies.set("rp_access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60, // 30 minutes
      path: "/",
    });

    response.cookies.set("rp_refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 24 * 60 * 60, // 15 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Refresh token không hợp lệ" }, { status: 401 });
  }
}
