
"use client";

import { VendorSidebarLayout } from "../_components/vendor-sidebar-layout";
import { VerificationProvider } from "@/context/vendor-verification-context";
import { VerificationFlowHandler } from "../_components/verification-flow-handler";


export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <VerificationProvider>
            <VendorSidebarLayout>
                <VerificationFlowHandler />
                {children}
            </VendorSidebarLayout>
        </VerificationProvider>
    );
}
