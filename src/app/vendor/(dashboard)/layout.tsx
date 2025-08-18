
"use client";

import React from "react";
import { useVerification } from "@/context/vendor-verification-context";
import { VendorSidebarLayout } from "./_components/vendor-sidebar-layout";
import { BrandedLoader } from "@/components/branded-loader";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { vendorType } = useVerification();
    
    // Redirect logic handled in root vendor layout now, so we just render the correct sidebar.
    if(!vendorType) {
        return <BrandedLoader />;
    }

    return <VendorSidebarLayout>{children}</VendorSidebarLayout>;
}
