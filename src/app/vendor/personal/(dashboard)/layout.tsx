
"use client";

import { VendorSidebarLayout } from "./_components/vendor-sidebar-layout";
import { VerificationFlowHandler } from "../../_components/verification-flow-handler";
import { useMemo } from "react";
import { initialConversations } from "../(dashboard)/messages/page";


export default function Layout({ children }: { children: React.ReactNode }) {
    const unreadMessages = useMemo(() => {
        return initialConversations.filter(c => c.unread).length;
    }, []);

    return (
        <VendorSidebarLayout unreadMessages={unreadMessages}>
            <VerificationFlowHandler />
            {children}
        </VendorSidebarLayout>
    );
}
