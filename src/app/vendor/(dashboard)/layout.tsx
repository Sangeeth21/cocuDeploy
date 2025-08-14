
"use client";

import { useVerification } from "@/context/vendor-verification-context";
import { VendorSidebarLayout as PersonalLayout } from "../personal/(dashboard)/_components/vendor-sidebar-layout";
import { VendorSidebarLayout as CorporateLayout } from "../corporate/(dashboard)/_components/vendor-sidebar-layout";
import { VendorSidebarLayout as BothLayout } from "../both/(dashboard)/_components/vendor-sidebar-layout";
import { BrandedLoader } from "@/components/branded-loader";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { vendorType, isVerified } = useVerification();
    
    if(!vendorType) {
        // This can be a loading state or a redirect to login if the type is not set
        return <BrandedLoader />;
    }

    if (vendorType === 'personalized') {
        return <PersonalLayout>{children}</PersonalLayout>;
    }

    if (vendorType === 'corporate') {
        return <CorporateLayout>{children}</CorporateLayout>;
    }
    
    if (vendorType === 'both') {
        return <BothLayout>{children}</BothLayout>;
    }

    // Fallback for unverified or other cases
    return <BothLayout>{children}</BothLayout>;
}
