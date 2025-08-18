
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
    // If the vendor type is known and doesn't match, redirect to the correct one.
    // This handles cases where a user might navigate here directly.
    if (vendorType && vendorType !== 'personalized') {
        router.replace(`/vendor/${vendorType}/dashboard`);
    } else {
        router.replace('/vendor/both/dashboard');
    }
  }, [vendorType, router]);

  // Show a loader while redirecting
  return <BrandedLoader />;
}
