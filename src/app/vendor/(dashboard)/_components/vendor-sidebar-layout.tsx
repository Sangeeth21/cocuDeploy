
"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarMenuBadge, useSidebar } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ListChecks, LineChart, MessageSquare, Settings, LogOut, Store, Warehouse, ChevronsLeft, ChevronsRight, Gift, ShieldAlert, LifeBuoy, Gavel, Building, User, Wand2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useVerification } from "@/context/vendor-verification-context";
import { NotificationPopover } from "@/components/notification-popover";
import { mockVendorActivity } from "@/lib/mock-data";


function CustomSidebarTrigger() {
    const { open, toggleSidebar } = useSidebar();
    
    return (
        <Button 
            className={cn(
                "absolute top-1/2 z-20 h-7 w-7 rounded-full -translate-y-1/2",
                open ? "right-[-14px]" : "right-[-14px] bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={toggleSidebar}
            size="icon"
            variant={open ? "outline" : "default"}
        >
            {open ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
        </Button>
    )
}

export function VendorSidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [greeting, setGreeting] = useState("Hi");
    const vendorName = "Timeless Co.";
    const { isVerified } = useVerification();


    useEffect(() => {
        const hasVisited = localStorage.getItem("hasVisitedVendorDashboard");
        if (!hasVisited) {
            setGreeting("Welcome");
            localStorage.setItem("hasVisitedVendorDashboard", "true");
        }
    }, []);

    const bothNavLinks = [
      { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/vendor/products", label: "Products", icon: Package },
      { href: "/vendor/inventory", label: "Inventory", icon: Warehouse },
      { href: "/vendor/orders", label: "Orders", icon: ListChecks },
      { href: "/vendor/bids", label: "Bidding", icon: Gavel },
      { href: "/vendor/templates", label: "Templates", icon: Wand2 },
      { href: "/vendor/analytics", label: "Analytics", icon: LineChart },
      { href: "/vendor/messages", label: "Messages", icon: MessageSquare, id: "messages" },
      { href: "/vendor/referrals", label: "Referrals", icon: Gift },
      { href: "/vendor/freebies", label: "Freebies", icon: Gift },
      { href: "/vendor/support", label: "Support", icon: LifeBuoy },
      { href: "/vendor/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen">
        <SidebarProvider>
            <Sidebar collapsible="icon" className="border-r hidden md:flex">
                <SidebarHeader>
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2">
                           <Avatar className="h-10 w-10">
                                <AvatarImage src="https://placehold.co/100x100.png" alt="Vendor Avatar" data-ai-hint="company logo" />
                                <AvatarFallback>V</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                                <span className="text-lg font-semibold">{greeting},</span>
                                <span className="text-lg font-bold -mt-1">{vendorName}</span>
                            </div>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent className="p-2">
                     <SidebarMenu>
                        {!isVerified && (
                             <SidebarMenuItem>
                                <SidebarMenuButton 
                                    asChild
                                    isActive={pathname === '/vendor/verify'}
                                    tooltip={{children: 'Complete Verification'}}
                                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                                >
                                    <Link href="/vendor/verify">
                                        <ShieldAlert />
                                        <span>Verify Account</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {bothNavLinks.map(link => (
                            <SidebarMenuItem key={link.href}>
                                <SidebarMenuButton 
                                    asChild
                                    isActive={pathname.startsWith(link.href)}
                                    tooltip={{children: link.label}}
                                >
                                    <Link href={link.href}>
                                        <link.icon />
                                        <span>{link.label}</span>
                                        {link.badge && <SidebarMenuBadge>{link.badge}</SidebarMenuBadge>}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={{children: 'Back to Store'}}>
                                <Link href="/">
                                    <Store />
                                    <span>Back to Store</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={{children: 'Log Out'}}>
                                <Link href="/vendor/login">
                                    <LogOut />
                                    <span>Log Out</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <CustomSidebarTrigger />
            </Sidebar>
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
                    {children}
                </main>
            </div>
        </SidebarProvider>
        </div>
    );
}
