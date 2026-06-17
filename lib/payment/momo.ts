import crypto from "node:crypto";

const MOMO_BASE =
  process.env.MOMO_ENV === "production"
    ? "https://payment.momo.vn/v2/gateway/api"
    : "https://test-payment.momo.vn/v2/gateway/api";

const PARTNER_CODE = process.env.MOMO_PARTNER_CODE ?? "";
const ACCESS_KEY = process.env.MOMO_ACCESS_KEY ?? "";
const SECRET_KEY = process.env.MOMO_SECRET_KEY ?? "";

function sign(raw: string): string {
  return crypto.createHmac("sha256", SECRET_KEY).update(raw).digest("hex");
}

export interface MomoPaymentResult {
  orderId: string;
  payUrl: string;
  qrCodeUrl: string;
  deeplink: string;
  expiresAt: Date;
}

export async function createMomoPayment(params: {
  orderId: string;
  amount: number;
  orderInfo: string;
  returnUrl: string;
  notifyUrl: string;
}): Promise<MomoPaymentResult> {
  const { orderId, amount, orderInfo, returnUrl, notifyUrl } = params;

  const raw =
    `accessKey=${ACCESS_KEY}&amount=${amount}&extraData=&ipnUrl=${notifyUrl}&orderId=${orderId}&orderInfo=${encodeURIComponent(orderInfo)}&partnerCode=${PARTNER_CODE}&redirectUrl=${returnUrl}&requestId=${orderId}&requestType=captureWallet`;

  const signature = sign(raw);

  const body = {
    partnerCode: PARTNER_CODE,
    accessKey: ACCESS_KEY,
    requestId: orderId,
    amount,
    orderId,
    orderInfo,
    redirectUrl: returnUrl,
    ipnUrl: notifyUrl,
    extraData: "",
    requestType: "captureWallet",
    lang: "vi",
    signature,
  };

  const res = await fetch(`${MOMO_BASE}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (data.resultCode !== 0) {
    throw new Error(`MoMo error: ${data.message} (${data.resultCode})`);
  }

  return {
    orderId,
    payUrl: data.payUrl,
    qrCodeUrl: data.qrCodeUrl ?? "",
    deeplink: data.deeplink ?? "",
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  };
}

export function verifyMomoSignature(data: Record<string, string>): boolean {
  const { signature, ...rest } = data;
  const raw = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("&");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(sign(raw)),
  );
}

export async function checkMomoPaymentStatus(orderId: string): Promise<{
  status: "pending" | "success" | "failed";
  transactionId?: string;
}> {
  const requestId = `${orderId}_check`;
  const raw =
    `accessKey=${ACCESS_KEY}&orderId=${orderId}&partnerCode=${PARTNER_CODE}&requestId=${requestId}`;

  const body = {
    partnerCode: PARTNER_CODE,
    accessKey: ACCESS_KEY,
    requestId,
    orderId,
    signature: sign(raw),
  };

  const res = await fetch(`${MOMO_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (data.resultCode === 0) {
    return {
      status: data.transId ? "success" : "pending",
      transactionId: data.transId,
    };
  }
  return { status: "failed" };
}
