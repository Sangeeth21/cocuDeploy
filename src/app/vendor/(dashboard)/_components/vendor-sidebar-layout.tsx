
"use client";

import { VendorSidebar } from "./vendor-sidebar";
import { VerificationFlowHandler } from "../../_components/verification-flow-handler";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NotificationPopover } from "@/components/notification-popover";
import { mockVendorActivity } from "@/lib/mock-data";


export function VendorSidebarLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex min-h-screen">
            <SidebarProvider>
                <VendorSidebar />
                <div className="flex flex-col flex-1">
                    <header className="flex h-16 items-center justify-between p-4 border-b md:justify-end bg-card">
                        <div className="flex items-center gap-4">
                            <span className="font-bold hidden max-md:inline-block">Vendor Portal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <NotificationPopover notifications={mockVendorActivity} />
                        </div>
                    </header>
                    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-muted/40 overflow-y-auto">
                        <VerificationFlowHandler />
                        {children}
                    </main>
                </div>
            </SidebarProvider>
        </div>
    );
}
