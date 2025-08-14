
"use client";

import { VendorSidebar } from "./_components/vendor-sidebar";
import { VerificationFlowHandler } from "../_components/verification-flow-handler";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
                <VendorSidebar />
                <div className="flex flex-col flex-1">
                     <main className="flex-1 p-4 sm:p-6 md:p-8 bg-muted/40 overflow-y-auto">
                        <VerificationFlowHandler />
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
