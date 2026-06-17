import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, transactionId } = body;

    const payment = await db.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (status === "success" || status === "PAID") {
      await db.payment.update({
        where: { orderId },
        data: {
          status: "success",
          transactionId: transactionId ?? payment.transactionId,
          paidAt: new Date(),
        },
      });

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
    console.error("VietQR webhook error:", err);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
