
"use client";

import React from "react";
import { VendorSidebarLayout } from "../../both/(dashboard)/_components/vendor-sidebar-layout";
import { VerificationFlowHandler } from "../../_components/verification-flow-handler";
import type { Conversation } from "@/lib/types";

// This layout now wraps the unified 'both' layout to provide the correct
// context and structure for a personalized vendor, while reusing the main dashboard components.
export default function Layout({ children }: { children: React.ReactNode }) {
    // In a real app, you might fetch specific unread counts here.
    const unreadMessages = 5;

    return (
        <VendorSidebarLayout unreadMessages={unreadMessages}>
            <VerificationFlowHandler />
            {children}
        </VendorSidebarLayout>
    );
}
