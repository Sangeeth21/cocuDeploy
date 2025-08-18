
"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarMenuBadge, useSidebar, CustomSidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ListChecks, LineChart, MessageSquare, Settings, LogOut, Store, Warehouse, Gift, ShieldAlert, LifeBuoy, Gavel, Building, User, Wand2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useVerification } from "@/context/vendor-verification-context";
import { NotificationPopover } from "@/components/notification-popover";
import { mockVendorActivity } from "@/lib/mock-data";

const personalNavLinks = [
  { href: "/vendor/personal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/personal/products", label: "Products", icon: Package },
  { href: "/vendor/templates", label: "Templates", icon: Wand2 },
  { href: "/vendor/personal/inventory", label: "Inventory", icon: Warehouse },
  { href: "/vendor/personal/orders", label: "Orders", icon: ListChecks },
  { href: "/vendor/personal/analytics", label: "Analytics", icon: LineChart },
  { href: "/vendor/personal/messages", label: "Messages", icon: MessageSquare, id: "messages" },
  { href: "/vendor/personal/referrals", label: "Referrals", icon: Gift },
  { href: "/vendor/personal/support", label: "Support", icon: LifeBuoy },
  { href: "/vendor/personal/settings", label: "Settings", icon: Settings },
];

const corporateNavLinks = [
  { href: "/vendor/corporate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/corporate/products", label: "Corporate Products", icon: Building },
  { href: "/vendor/templates", label: "Templates", icon: Wand2 },
  { href: "/vendor/corporate/inventory", label: "Inventory", icon: Warehouse },
  { href: "/vendor/corporate/orders", label: "Corporate Orders", icon: ListChecks },
  { href: "/vendor/corporate/bids", label: "Bidding", icon: Gavel },
  { href: "/vendor/corporate/analytics", label: "Analytics", icon: LineChart },
  { href: "/vendor/corporate/messages", label: "Corporate Messages", icon: MessageSquare, id: "messages" },
  { href: "/vendor/corporate/referrals", label: "Referrals", icon: Gift },
  { href: "/vendor/corporate/support", label: "Support", icon: LifeBuoy },
  { href: "/vendor/corporate/settings", label: "Settings", icon: Settings },
];

const bothNavLinks = [
  { href: "/vendor/both/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/both/products", label: "Products", icon: Package },
  { href: "/vendor/both/inventory", label: "Inventory", icon: Warehouse },
  { href: "/vendor/both/orders", label: "Orders", icon: ListChecks },
  { href: "/vendor/both/bids", label: "Bidding", icon: Gavel },
  { href: "/vendor/templates", label: "Templates", icon: Wand2 },
  { href: "/vendor/both/analytics", label: "Analytics", icon: LineChart },
  { href: "/vendor/both/messages", label: "Messages", icon: MessageSquare, id: "messages" },
  { href: "/vendor/both/referrals", label: "Referrals", icon: Gift },
  { href: "/vendor/both/support", label: "Support", icon: LifeBuoy },
  { href: "/vendor/both/settings", label: "Settings", icon: Settings },
];


function VendorSidebarLayoutContent({ children, unreadMessages = 0 }: { children: React.ReactNode; unreadMessages?: number }) {
    const pathname = usePathname();
    const { isVerified, vendorType } = useVerification();
    const { open: isSidebarOpen } = useSidebar();
    
    const navLinks = vendorType === 'corporate' ? corporateNavLinks : vendorType === 'personalized' ? personalNavLinks : bothNavLinks;
    const vendorName = vendorType === 'corporate' ? 'Corporate Vendor' : vendorType === 'personalized' ? 'Personal Vendor' : 'Hybrid Vendor';

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar collapsible="icon" className="border-r hidden md:flex">
                <SidebarHeader>
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2">
                           <Avatar className="h-10 w-10">
                                <AvatarImage src="https://placehold.co/100x100.png" alt="Vendor Avatar" data-ai-hint="company logo" />
                                <AvatarFallback>V</AvatarFallback>
                            </Avatar>
                            <div className={cn("flex flex-col", !isSidebarOpen && "hidden")}>
                                <span className="text-lg font-semibold">{vendorName},</span>
                                <span className="text-lg font-bold -mt-1">Timeless Co.</span>
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
                                        <ShieldAlert className="h-5 w-5 stroke-[1.5]" />
                                        <span className={cn(!isSidebarOpen && "hidden")}>Verify Account</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {navLinks.map((link) => {
                            const showBadge = link.id === 'messages' && unreadMessages > 0;
                            const isActive = pathname.startsWith(link.href);
                            return (
                            <SidebarMenuItem key={link.href}>
                                <SidebarMenuButton 
                                    asChild
                                    isActive={isActive}
                                    tooltip={{children: link.label}}
                                >
                                    <Link href={link.href}>
                                        <link.icon className="h-5 w-5 stroke-[1.5]" />
                                        <span className={cn(!isSidebarOpen && "hidden")}>{link.label}</span>
                                         {showBadge && <SidebarMenuBadge>{unreadMessages}</SidebarMenuBadge>}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )})}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={{children: 'Back to Store'}}>
                                <Link href="/">
                                    <Store className="h-5 w-5 stroke-[1.5]" />
                                    <span className={cn(!isSidebarOpen && "hidden")}>Back to Store</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={{children: 'Log Out'}}>
                                <Link href="/vendor/login">
                                    <LogOut className="h-5 w-5 stroke-[1.5]" />
                                    <span className={cn(!isSidebarOpen && "hidden")}>Log Out</span>
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
        </div>
    );
}

export function VendorSidebarLayout({ children, unreadMessages = 0 }: { children: React.ReactNode; unreadMessages?: number }) {
    return (
        <SidebarProvider>
            <VendorSidebarLayoutContent unreadMessages={unreadMessages}>
                {children}
            </VendorSidebarLayoutContent>
        </SidebarProvider>
    )
}
