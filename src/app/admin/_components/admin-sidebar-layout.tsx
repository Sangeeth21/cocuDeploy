
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarMenuBadge, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ListChecks, BarChart3, Users, Settings, LogOut, ShieldCheck, Home, MessageSquare, Store, DollarSign, Megaphone, PlusCircle, Sparkles, ChevronsLeft, ChevronsRight, Combine, Gift } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationPopover } from "@/components/notification-popover";
import { mockActivity } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/vendors", label: "Vendors", icon: Store },
  { href: "/admin/customers", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ListChecks },
  { href: "/admin/commissions", label: "Commissions", icon: DollarSign },
  { href: "/admin/chat-logs", label: "Chat Logs", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/product-combos", label: "Product Combos", icon: Combine },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/referrals", label: "Referrals", icon: Gift },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldCheck, badge: "3" },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

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

export function AdminSidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen">
        <SidebarProvider>
            <Sidebar collapsible="icon" className="border-r hidden md:flex">
                <SidebarHeader>
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2">
                           <Avatar className="h-10 w-10">
                                <AvatarImage src="https://placehold.co/100x100.png" alt="Admin Avatar" data-ai-hint="person face" />
                                <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                                <span className="text-lg font-semibold">Admin</span>
                            </div>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent className="p-2">
                     <SidebarMenu>
                        <SidebarMenuItem>
                             <SidebarMenuButton asChild tooltip={{children: 'Create Order'}}>
                                <Link href="/admin/orders/new">
                                    <PlusCircle/>
                                    <span>New Order</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                             <SidebarMenuButton asChild tooltip={{children: 'Create Campaign'}}>
                                <Link href="/admin/marketing/new">
                                    <Megaphone/>
                                    <span>New Campaign</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        {navLinks.map(link => (
                            <SidebarMenuItem key={link.href}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith(link.href) && (link.href !== "/admin" || pathname === "/admin")}
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
                            <SidebarMenuButton asChild tooltip={{children: 'Back to Homepage'}}>
                                <Link href="/">
                                    <Home />
                                    <span>Homepage</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={{children: 'Log Out'}}>
                                <Link href="/admin-login">
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
                         <span className="font-bold hidden max-md:inline-block">Admin Portal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationPopover notifications={mockActivity} />
                    </div>
                 </header>
                 <main className="flex-1 p-4 sm:p-6 md:p-8 bg-muted/40 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </SidebarProvider>
        </div>
    );
}
