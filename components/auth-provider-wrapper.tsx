"use client";

import { AuthProvider } from "@/components/auth-context";

export default function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
