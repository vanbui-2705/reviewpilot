import { SignJWT, jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me"
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me"
);

const ACCESS_TTL = "30m";
const REFRESH_TTL = "15d";

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  shopId?: string;
  type: "access" | "refresh";
}

export async function signAccessToken(payload: Omit<JWTPayload, "type">): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(ACCESS_TTL)
    .setIssuedAt()
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: Omit<JWTPayload, "type">): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(REFRESH_TTL)
    .setIssuedAt()
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify<JWTPayload>(token, ACCESS_SECRET);
  if (payload.type !== "access") {
    throw new Error("Invalid token type: expected access");
  }
  return payload;
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify<JWTPayload>(token, REFRESH_SECRET);
  if (payload.type !== "refresh") {
    throw new Error("Invalid token type: expected refresh");
  }
  return payload;
}
