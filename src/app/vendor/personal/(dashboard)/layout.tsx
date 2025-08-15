
"use client";

import React, { useState, useMemo } from "react";
import { VendorSidebarLayout } from "../../both/(dashboard)/_components/vendor-sidebar-layout";
import { VerificationFlowHandler } from "../../_components/verification-flow-handler";
import type { Conversation } from "@/lib/types";


export default function Layout({ children }: { children: React.ReactNode }) {
     // In a real app, you might fetch specific unread counts here.
    const unreadMessages = 1;

    return (
        <VendorSidebarLayout unreadMessages={unreadMessages}>
            <VerificationFlowHandler />
             {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    // This is a placeholder for passing live data down.
                    // The child pages are now responsible for fetching their own data.
                    return React.cloneElement(child as React.ReactElement, {} as any);
                }
                return child;
            })}
        </VendorSidebarLayout>
    );
}

