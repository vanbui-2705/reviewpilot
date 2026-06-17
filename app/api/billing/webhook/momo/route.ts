import { NextResponse } from "next/server";
import { verifyMomoSignature } from "@/lib/payment/momo";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verify MoMo signature
    if (!verifyMomoSignature(body)) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    const { orderId, resultCode, transId, amount } = body;

    const payment = await db.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (resultCode === 0) {
      await db.payment.update({
        where: { orderId },
        data: {
          status: "success",
          transactionId: String(transId),
          paidAt: new Date(),
        },
      });

      // Update user shop plan if needed
      if (payment.userId) {
        await db.shop.updateMany({
          where: { userId: payment.userId },
          data: { plan: payment.plan },
        });
      }
    } else {
      await db.payment.update({
        where: { orderId },
        data: { status: "failed" },
      });
    }

    return NextResponse.json({ message: "OK" });
  } catch (err) {
    console.error("MoMo webhook error:", err);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
