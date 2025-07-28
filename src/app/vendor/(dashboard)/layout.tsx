
"use client";

import { VendorSidebarLayout } from "../_components/vendor-sidebar-layout";
import { VerificationFlowHandler } from "../_components/verification-flow-handler";


export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <VendorSidebarLayout>
            <VerificationFlowHandler />
            {children}
        </VendorSidebarLayout>
    );
}
