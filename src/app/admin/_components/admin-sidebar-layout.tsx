
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarMenuBadge, SidebarHeader, useSidebar, SidebarInset, CustomSidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ListChecks, BarChart3, Users, Settings, LogOut, ShieldCheck, Home, MessageSquare, Store, DollarSign, Megaphone, PlusCircle, Sparkles, ChevronsLeft, ChevronsRight, Combine, Gift, LifeBuoy, Building, Gavel, ImageIcon, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NotificationPopover } from "@/components/notification-popover";
import { mockActivity } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/context/admin-auth-context";


const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/vendors", label: "Vendors", icon: Store },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: LayoutGrid },
  { href: "/admin/orders", label: "Orders", icon: ListChecks },
  { href: "/admin/bids", label: "Bids", icon: Gavel },
  { href: "/admin/commissions", label: "Commissions", icon: DollarSign },
  { href: "/admin/chat-logs", label: "Chat Logs", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/product-combos", label: "Product Combos", icon: Combine },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/corporate-marketing", label: "Corporate Marketing", icon: Building },
  { href: "/admin/ai-styles", label: "AI Image Styles", icon: ImageIcon },
  { href: "/admin/referrals", label: "Referrals", icon: Gift },
  { href: "/admin/support", label: "Support", icon: LifeBuoy, badge: "2" },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldCheck, badge: "3" },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminSidebarLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { adminLogout } = useAdminAuth();
    const { open } = useSidebar();

    const handleLogout = () => {
        adminLogout();
        router.push('/admin-login');
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src="https://placehold.co/100x100.png" alt="Admin Avatar" data-ai-hint="person face" />
                                <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            <div className={cn("flex flex-col", !open && "hidden")}>
                                <span className="text-lg font-semibold">Admin</span>
                            </div>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={{children: 'Create Order'}} size="sm">
                                <Link href="/admin/orders/new">
                                    <PlusCircle />
                                    <span className={cn(!open && "hidden")}>New Order</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={{children: 'Create Campaign'}} size="sm">
                                <Link href="/admin/marketing/new">
                                    <Megaphone />
                                    <span className={cn(!open && "hidden")}>New Campaign</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={{children: 'New Corporate Campaign'}} size="sm">
                                <Link href="/admin/corporate-marketing/new">
                                    <Building />
                                    <span className={cn(!open && "hidden")}>New Corporate Campaign</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        {navLinks.map(link => (
                            <SidebarMenuItem key={link.href}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith(link.href) && (link.href !== "/admin" || pathname === "/admin")}
                                    tooltip={{children: link.label}}
                                    size="sm"
                                >
                                    <Link href={link.href}>
                                        <link.icon />
                                        <span className={cn(!open && "hidden")}>{link.label}</span>
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
                            <SidebarMenuButton asChild tooltip={{children: 'Back to Homepage'}} size="sm">
                                <Link href="/">
                                    <Home />
                                    <span className={cn(!open && "hidden")}>Homepage</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleLogout} tooltip={{children: 'Log Out'}} size="sm">
                                <LogOut />
                                <span className={cn(!open && "hidden")}>Log Out</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                 <CustomSidebarTrigger />
            </Sidebar>
            <div className="flex-1 flex flex-col">
                <header className="flex h-16 items-center justify-between p-4 border-b md:justify-end bg-card">
                    <div className="flex items-center gap-4">
                        <span className="font-bold hidden max-md:inline-block">Admin Portal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationPopover notifications={mockActivity} />
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 md:p-8 bg-muted/40 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}

export function AdminSidebarLayout({ children }: { children: React.ReactNode }) {
    return (
         <SidebarProvider>
            <AdminSidebarLayoutContent>{children}</AdminSidebarLayoutContent>
        </SidebarProvider>
    );
}
