
"use client";

import React, { useState, useMemo } from "react";
import { VendorSidebarLayout } from "./_components/vendor-sidebar-layout";
import { VerificationFlowHandler } from "../../_components/verification-flow-handler";
import type { Conversation, Message } from "@/lib/types";
import { initialConversations } from "../../both/(dashboard)/layout";


export default function Layout({ children }: { children: React.ReactNode }) {
    const [conversations, setConversations] = useState(initialConversations);

    const unreadMessages = useMemo(() => {
        return conversations.filter(c => c.unread && c.type === 'customer').length;
    }, [conversations]);

    return (
        <VendorSidebarLayout unreadMessages={unreadMessages}>
            <VerificationFlowHandler />
             {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement, { conversations, setConversations } as any);
                }
                return child;
            })}
        </VendorSidebarLayout>
    );
}
