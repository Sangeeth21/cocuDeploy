
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CorporateSidebarLayout } from "./_components/corporate-sidebar-layout";
import { AdminAuthProvider, useAdminAuth } from "@/context/admin-auth-context";
import { BidRequestProvider } from "@/context/bid-request-context";

function ProtectedCorporateLayout({ children }: { children: React.ReactNode }) {
  const { isAdminLoggedIn } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  // This check is a placeholder for corporate-specific authentication
  useEffect(() => {
    // If we are on a protected corporate route and not logged in, redirect to the login page.
    if (!isAdminLoggedIn && pathname !== '/corporate') {
      router.replace("/corporate");
    }
  }, [isAdminLoggedIn, router, pathname]);
  
  // The /corporate page is the login page, so it should not have the sidebar layout.
  if (pathname === '/corporate') {
    return <>{children}</>;
  }

  // For any other page inside /corporate/*, if the user is not logged in, we show a loader/null
  // while the useEffect above triggers the redirect.
  if (!isAdminLoggedIn) {
    return null; // Or a loading spinner
  }

  // If logged in and on a protected corporate route, show the sidebar layout.
  return (
    <CorporateSidebarLayout>
      {children}
    </CorporateSidebarLayout>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
        <BidRequestProvider>
          <ProtectedCorporateLayout>
            {children}
          </ProtectedCorporateLayout>
        </BidRequestProvider>
    </AdminAuthProvider>
  );
}
