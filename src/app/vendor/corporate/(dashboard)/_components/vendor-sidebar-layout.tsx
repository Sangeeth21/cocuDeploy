
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useVerification } from "@/context/vendor-verification-context";
import { BrandedLoader } from "@/components/branded-loader";

// This component is now a redirector to the unified dashboard layout.
export function VendorSidebarLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { vendorType } = useVerification();

  useEffect(() => {
     if (vendorType && vendorType !== 'corporate') {
        router.replace(`/vendor/${vendorType}/dashboard`);
    } else {
        router.replace('/vendor/both/dashboard');
    }
  }, [vendorType, router]);

  // Show a loader while redirecting
  return <BrandedLoader />;
}
