
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarMenuBadge } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ListChecks, LineChart, MessageSquare, Settings, LogOut, Store, Warehouse } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";


const navLinks = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/products", label: "Products", icon: Package },
  { href: "/vendor/inventory", label: "Inventory", icon: Warehouse },
  { href: "/vendor/orders", label: "Orders", icon: ListChecks },
  { href: "/vendor/analytics", label: "Analytics", icon: LineChart },
  { href: "/vendor/messages", label: "Messages", icon: MessageSquare, badge: "5" },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
];

export function VendorSidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [greeting, setGreeting] = useState("Hi");
    const vendorName = "Timeless Co.";

    useEffect(() => {
        const hasVisited = localStorage.getItem("hasVisitedVendorDashboard");
        if (!hasVisited) {
            setGreeting("Welcome");
            localStorage.setItem("hasVisitedVendorDashboard", "true");
        }
    }, []);

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
                         <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
                    </div>
                </SidebarHeader>
                <SidebarContent className="p-2">
                     <SidebarMenu>
                        {navLinks.map(link => (
                            <SidebarMenuItem key={link.href}>
                                <SidebarMenuButton 
                                    asChild
                                    isActive={pathname === link.href}
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
                                <Link href="/login">
                                    <LogOut />
                                    <span>Log Out</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <div className="flex flex-col flex-1">
                 <header className="flex h-16 items-center justify-between p-4 border-b md:justify-end">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="md:hidden"/>
                        <span className="font-bold hidden max-md:inline-block">Vendor Portal</span>
                    </div>
                 </header>
                 <main className="flex-1 p-4 sm:p-6 md:p-8 bg-muted/40">
                    {children}
                </main>
            </div>
        </SidebarProvider>
        </div>
    );
}
