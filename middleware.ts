import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me"
);

const PUBLIC = [
  "/",
  "/login",
  "/pricing",
  "/about",
  "/contact",
  "/faq",
  "/blog",
  "/products",
  "/search",
  "/compare",
  "/deals",
  "/price-alerts",
  "/affiliate",
  "/dich-vu",
  "/tools",
  "/try",
  "/api/auth/",
  "/api/download/",
  "/api/search/",
  "/api/leads/",
  "/api/products/",
  "/api/affiliate/",
  "/api/crawl",
  "/api/tools/crawl",
];

function isPublic(p: string) {
  return PUBLIC.some((base) => {
    if (base === "/") return p === "/";
    return p === base || p.startsWith(base);
  });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const deny = (status: 401 | 403) => {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: status === 401 ? "Unauthorized" : "Forbidden" },
        { status }
      );
    }
    return NextResponse.redirect(
      new URL(status === 401 ? "/login" : "/", req.url)
    );
  };

  // Read JWT access token from cookie
  const raw = req.cookies.get("rp_access_token")?.value;
  if (!raw) return deny(401);

  let role: string | null = null;
  try {
    const { payload } = await jwtVerify(raw, ACCESS_SECRET, {
      algorithms: ["HS256"],
    });
    if (payload.type !== "access") return deny(401);
    role = (payload as { role: string }).role ?? null;
  } catch {
    return deny(401);
  }

  if (!role) return deny(401);

  // Admin check
  if (pathname.startsWith("/admin") && role !== "admin") return deny(403);

  // Dashboard/try: shop or admin only
  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/try")) &&
    !["admin", "shop"].includes(role)
  ) {
    return deny(403);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
