import { NextResponse } from "next/server";
import { getShop, updateShop, deleteShop } from "@/lib/shopee/service";

type RouteContext = { params: { id: string } };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const body = await req.json();

    const existing = await getShop(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 }
      );
    }

    const shop = await updateShop(id, body);
    return NextResponse.json({ success: true, data: shop });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to update shop" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = context.params;

    const existing = await getShop(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 }
      );
    }

    await deleteShop(id);
    return NextResponse.json({ success: true, data: null });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to delete shop" },
      { status: 500 }
    );
  }
}
