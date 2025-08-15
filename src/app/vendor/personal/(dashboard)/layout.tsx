
"use client";

import React, { useState, useMemo } from "react";
import { VendorSidebarLayout } from "./_components/vendor-sidebar-layout";
import { VerificationFlowHandler } from "../../_components/verification-flow-handler";
import type { Conversation, Message } from "@/lib/types";

// Lifted initial conversation data to the layout
const initialConversations: (Conversation & {type: 'customer' | 'corporate'})[] = [
  {
    id: 1,
    customerId: "CUST001",
    vendorId: "VDR001",
    avatar: "https://placehold.co/40x40.png",
    messages: [
      { id: 'msg1', sender: "customer", text: "Hi! I'm interested in the Classic Leather Watch. Is it available in black?" },
      { id: 'msg2', sender: "vendor", text: "Hello! Yes, the Classic Leather Watch is available with a black strap. I can update the listing if you'd like to purchase it.", status: 'read' },
      { id: 'msg3', sender: "customer", text: "That would be great, thank you!", attachments: [{name: 'watch_photo.jpg', type: 'image', url: 'https://placehold.co/300x200.png'}] },
    ],
    unread: true,
    unreadCount: 1,
    userMessageCount: 3,
    awaitingVendorDecision: false,
    status: 'active',
    type: 'customer',
  },
  {
    id: 2,
    customerId: "CUST002",
    vendorId: "VDR002",
    avatar: "https://placehold.co/40x40.png",
    messages: [{ id: 'msg4', sender: "customer", text: "Can you ship to Canada?", attachments: [{name: 'shipping_question.pdf', type: 'file', url: '#'}] }],
    unread: true,
    unreadCount: 1,
    userMessageCount: 1,
    awaitingVendorDecision: false,
    status: 'active',
    type: 'customer',
  },
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
