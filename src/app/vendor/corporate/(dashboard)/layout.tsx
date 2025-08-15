
"use client";

import React, { useState, useMemo } from "react";
import { VendorSidebarLayout } from "./_components/vendor-sidebar-layout";
import { VerificationFlowHandler } from "../../_components/verification-flow-handler";
import type { Conversation } from "@/lib/types";

const initialConversations: (Conversation & {type: 'customer' | 'corporate'})[] = [
  {
    id: 5,
    customerId: "Corporate Client Inc.",
    vendorId: "VDR001",
    avatar: "https://placehold.co/40x40.png",
    messages: [
      { id: 'ccm1', sender: 'customer', text: 'Hello, we are interested in a bulk order of the Classic Leather Watch for a corporate event. Can you provide a quote for 500 units?' },
      { id: 'ccm2', sender: 'vendor', text: 'Absolutely! For 500 units, we can offer a price of $159.99 per unit. This includes custom engraving on the back. What is your required delivery date?', status: 'sent'},
      { id: 'ccm3', sender: 'customer', text: 'Delivery by end of next month is ideal. Can you also share specs on the engraving options?' },
      { id: 'ccm4', sender: 'vendor', text: 'Certainly. We can engrave text or simple logos. I will send over a spec sheet. Are there any other customizations you need?', status: 'sent' },
      { id: 'ccm5', sender: 'customer', text: 'Not at this time. The spec sheet will be helpful. Thank you.' },
    ],
    unread: true,
    userMessageCount: 2, // Set to initial corporate limit
    awaitingVendorDecision: false,
    status: 'active',
    type: 'corporate',
  }
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const [conversations, setConversations] = useState(initialConversations);

    const unreadMessages = useMemo(() => {
        if (!conversations) return 0;
        return conversations.filter(c => c.unread).length;
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
