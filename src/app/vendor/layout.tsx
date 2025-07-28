
"use client";

import { VerificationProvider } from "@/context/vendor-verification-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <VerificationProvider>
      {children}
    </VerificationProvider>
  );
}
