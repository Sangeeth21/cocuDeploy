
"use client";

import { useVerification } from "@/context/vendor-verification-context";
import { VendorSidebarLayout as PersonalLayout } from "../personal/(dashboard)/_components/vendor-sidebar-layout";
import { VendorSidebarLayout as CorporateLayout } from "../corporate/(dashboard)/_components/vendor-sidebar-layout";
import { VendorSidebarLayout as BothLayout } from "../both/(dashboard)/_components/vendor-sidebar-layout";
import { BrandedLoader } from "@/components/branded-loader";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { vendorType, isVerified } = useVerification();
    
    // Redirect logic handled in root vendor layout now, so we just render the correct sidebar.
    if(!vendorType) {
        return <BrandedLoader />;
    }

    if (vendorType === 'personalized') {
        return <PersonalLayout>{children}</PersonalLayout>;
    }

    if (vendorType === 'corporate') {
        return <CorporateLayout>{children}</CorporateLayout>;
    }
    
    // Default to the 'both' layout
    return <BothLayout>{children}</BothLayout>;
}
