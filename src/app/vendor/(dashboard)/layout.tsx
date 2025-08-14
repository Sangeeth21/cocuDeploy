
"use client";

import { useVerification } from "@/context/vendor-verification-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BrandedLoader } from "@/components/branded-loader";
import { VendorSidebarLayout } from "./_components/vendor-sidebar-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { vendorType } = useVerification();
    const router = useRouter();

    useEffect(() => {
        if (!vendorType) {
            router.replace('/vendor/login');
        }
    }, [vendorType, router]);

    if (!vendorType) {
        return <BrandedLoader />;
    }

    return (
        <VendorSidebarLayout>
            {children}
        </VendorSidebarLayout>
    );
}
