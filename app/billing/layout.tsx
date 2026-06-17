import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Billing - Subscription & Thanh toan",
  "Nang cap goi dich vu ReviewPilot. Thanh toan MoMo, VietQR nhanh chong.",
  "/billing"
);

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
