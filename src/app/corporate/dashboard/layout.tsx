
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CorporateSidebarLayout } from "./_components/corporate-sidebar-layout";
import { AdminAuthProvider, useAdminAuth } from "@/context/admin-auth-context";

function ProtectedCorporateLayout({ children }: { children: React.ReactNode }) {
  const { isAdminLoggedIn } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdminLoggedIn) {
      router.replace("/corporate");
    }
  }, [isAdminLoggedIn, router]);

  if (!isAdminLoggedIn) {
    return null; // Or a loading spinner
  }

  return (
    <CorporateSidebarLayout>
      {children}
    </CorporateSidebarLayout>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <ProtectedCorporateLayout>
        {children}
      </ProtectedCorporateLayout>
    </AdminAuthProvider>
  );
}
