import { NextResponse } from "next/server";
import { getSession } from "@/lib/rbac/session";

export async function GET() {
  try {
    const user = await getSession();
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
