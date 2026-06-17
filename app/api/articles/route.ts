import { NextResponse } from "next/server";

// Article model was removed from schema — return empty for now
export async function GET() {
return NextResponse.json({ ok: true, articles: [] });
}
