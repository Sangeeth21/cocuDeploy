
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarMenuBadge, SidebarHeader } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ListChecks, BarChart3, Users, Settings, LogOut, ShieldCheck, Home, MessageSquare, Store, DollarSign, Megaphone, PlusCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";


const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/vendors", label: "Vendors", icon: Store },
  { href: "/admin/customers", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ListChecks },
  { href: "/admin/smart-pricing", label: "Smart Pricing", icon: Sparkles },
  { href: "/admin/chat-logs", label: "Chat Logs", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldCheck, badge: "3" },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

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
                         <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
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
                 <header className="flex h-16 items-center justify-between p-4 border-b md:justify-end bg-card">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="md:hidden"/>
                        <span className="font-bold hidden max-md:inline-block">Admin Portal</span>
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
