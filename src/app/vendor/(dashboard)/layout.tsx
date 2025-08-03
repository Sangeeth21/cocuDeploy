
"use client";

import { useVerification } from "@/context/vendor-verification-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BrandedLoader } from "@/components/branded-loader";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { vendorType, isVerified } = useVerification();
    const router = useRouter();

    useEffect(() => {
        if (vendorType) {
            router.replace(`/vendor/${vendorType}/dashboard`);
        } else {
            // If no vendorType is set (e.g., direct navigation), redirect to login
            router.replace('/vendor/login');
        }
    }, [vendorType, router]);

    // Show a loader while redirecting to avoid flashing content
    return <BrandedLoader />;
}
