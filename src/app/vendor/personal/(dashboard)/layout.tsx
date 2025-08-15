
"use client";

import { VendorSidebarLayout } from "../../both/(dashboard)/_components/vendor-sidebar-layout";
import { VerificationFlowHandler } from "../../_components/verification-flow-handler";
import React from "react";

// This layout now wraps the unified 'both' layout to provide the correct
// context and structure for a personalized vendor, while reusing the main dashboard components.
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <VendorSidebarLayout>
            <VerificationFlowHandler />
            {children}
        </VendorSidebarLayout>
    );
}
