
"use client";

import React, { useMemo } from "react";
import { VendorSidebarLayout } from "./_components/vendor-sidebar-layout";
import { VerificationFlowHandler } from "../../_components/verification-flow-handler";
import { initialConversations } from "../(dashboard)/messages/page";


export default function Layout({ children }: { children: React.ReactNode }) {
    const unreadMessages = useMemo(() => {
        return initialConversations.filter(c => c.unread && c.type === 'customer').length;
    }, []);

    return (
        <VendorSidebarLayout unreadMessages={unreadMessages}>
            <VerificationFlowHandler />
            {children}
        </VendorSidebarLayout>
    );
}
