
"use client";

import { VerificationProvider } from "@/context/vendor-verification-context";
import { UserProvider } from "@/context/user-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <VerificationProvider>
        {children}
      </VerificationProvider>
    </UserProvider>
  );
}
