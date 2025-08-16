

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { VendorSidebarLayout } from "./_components/vendor-sidebar-layout";
import { VerificationFlowHandler } from "../../_components/verification-flow-handler";
import type { Conversation, Message } from "@/lib/types";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const vendorId = "VDR001"; // Placeholder for logged-in vendor

    useEffect(() => {
        const q = query(collection(db, "conversations"), where("vendorId", "==", vendorId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Conversation));
            setConversations(convos);
        });

        return () => unsubscribe();
    }, [vendorId]);


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
