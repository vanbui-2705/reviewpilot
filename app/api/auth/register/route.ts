import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const MIN_PASSWORD_LENGTH = 6;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email là bắt buộc" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự` },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Tên là bắt buộc" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check email already exists
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: "Email đã được đăng ký" }, { status: 409 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with default role "shop" and status "active"
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        role: "SHOP_OWNER",
        status: "active",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.toLowerCase() as "shop",
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
