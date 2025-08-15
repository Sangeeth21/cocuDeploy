
"use client";

import React, { useState, useMemo } from "react";
import { VendorSidebarLayout } from "./_components/vendor-sidebar-layout";
import { VerificationFlowHandler } from "../../_components/verification-flow-handler";
import type { Conversation, Message } from "@/lib/types";

// The single source of truth for conversation data for this layout and its children.
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
    userMessageCount: 1, // Customer sent 2, vendor 1
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
    userMessageCount: 1,
    awaitingVendorDecision: false,
    status: 'active',
    type: 'customer',
  },
  {
    id: 3,
    customerId: "CUST003",
    vendorId: "VDR003",
    avatar: "https://placehold.co/40x40.png",
    messages: [{ id: 'msg5', sender: "vendor", text: "Thank you!", status: 'delivered' }],
    unread: false,
    userMessageCount: 0,
    awaitingVendorDecision: false,
    status: 'active',
    type: 'customer',
  },
   {
    id: 4,
    customerId: "CUST004",
    vendorId: "VDR004",
    avatar: "https://placehold.co/40x40.png",
    messages: [
        { id: 'msg6', sender: "customer", text: "What is the return policy?" },
        { id: 'msg7', sender: "customer", text: "Also, do you have this in blue?" },
        { id: 'msg8', sender: "customer", text: "And one more thing..." },
        { id: 'msg9', sender: "customer", text: "Can I get a discount?" },
    ],
    unread: true,
    userMessageCount: 4, // Set to limit to test
    awaitingVendorDecision: false,
    status: 'active',
    type: 'customer',
  },
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
    userMessageCount: 0,
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
                    // Pass the conversations and the setter to the child page component
                    return React.cloneElement(child, { conversations, setConversations } as any);
                }
                return child;
            })}
        </VendorSidebarLayout>
    );
}
