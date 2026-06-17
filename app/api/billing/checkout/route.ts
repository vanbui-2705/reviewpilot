import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createMomoPayment, createVietQR } from "@/lib/payment/momo";
import { cookies } from "next/headers";

const schema = z.object({
  plan: z.enum(["starter", "pro", "enterprise"]),
  method: z.enum(["momo", "vietqr"]).default("vietqr"),
});

const PLAN_PRICES: Record<string, number> = {
  starter: 200_000,
  pro: 400_000,
  enterprise: 1_000_000,
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("rp_access_token")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ ok: false, error: "Chưa đăng nhập" }, { status: 401 });
    }

    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 },
      );
    }

    const { plan, method } = parsed.data;
    const amount = PLAN_PRICES[plan];
    const orderId = `RP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    if (method === "momo") {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const result = await createMomoPayment({
        orderId,
        amount,
        orderInfo: `ReviewPilot - Goi ${plan}`,
        returnUrl: `${baseUrl}/billing?success=1`,
        notifyUrl: `${baseUrl}/api/billing/webhook/momo`,
      });

      await db.payment.create({
        data: {
          orderId,
          plan,
          method: "momo",
          amount,
          status: "pending",
          momoPayUrl: result.payUrl,
          momoQrCode: result.qrCodeUrl,
          expiresAt,
        },
      });

      return NextResponse.json({
        ok: true,
        method: "momo",
        payUrl: result.payUrl,
        qrCodeUrl: result.qrCodeUrl,
        orderId,
        expiresAt: expiresAt.toISOString(),
      });
    }

    // VietQR
    const vietqr = createVietQR({
      amount,
      accountNumber: process.env.VIETQR_ACCOUNT_NUMBER ?? "",
      accountName: process.env.VIETQR_ACCOUNT_NAME ?? "",
      bankCode: process.env.VIETQR_BANK_CODE ?? "970436",
      transferContent: `ReviewPilot ${plan} ${orderId}`,
    });

    await db.payment.create({
      data: {
        orderId,
        plan,
        method: "vietqr",
        amount,
        status: "pending",
        vietqrImage: vietqr.qrImageUrl,
        bankInfo: {
          bankName: vietqr.bankName,
          accountNumber: vietqr.accountNumber,
          accountHolder: vietqr.accountName,
          transferContent: vietqr.transferContent,
        },
        expiresAt,
      },
    });

    return NextResponse.json({
      ok: true,
      method: "vietqr",
      qrImageUrl: vietqr.qrImageUrl,
      bankInfo: vietqr.bankName,
      accountNumber: vietqr.accountNumber,
      accountName: vietqr.accountName,
      transferContent: vietqr.transferContent,
      orderId,
      amount,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { ok: false, error: "Loi he thong, vui long thu lai sau" },
      { status: 500 },
    );
  }
}
