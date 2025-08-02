
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { LayoutDashboard, LogOut, Settings, Gavel, Briefcase, Building, Package, FileText, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/context/admin-auth-context";


const navLinks = [
  { href: "/corporate/dashboard", label: "Marketplace", icon: Building },
  { href: "/corporate/products", label: "Products", icon: Package },
  { href: "/corporate/bids", label: "Active Bids", icon: Gavel },
  { href: "/corporate/orders", label: "Order History", icon: Briefcase },
  { href: "/corporate/quotes", label: "My Quotes", icon: FileText },
  { href: "/corporate/account", label: "Account", icon: User },
  { href: "/corporate/settings", label: "Settings", icon: Settings },
];

export function CorporateSidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { adminLogout } = useAdminAuth();

    const handleLogout = () => {
        adminLogout();
        router.push('/corporate');
    }

    return (
        <div className="flex min-h-screen">
        <SidebarProvider>
            <Sidebar 
                collapsible="icon" 
                className="border-r hidden md:flex" 
                defaultOpen={false}
            >
                <SidebarHeader>
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2">
                           <Avatar className="h-10 w-10">
                               <Building className="h-6 w-6"/>
                            </Avatar>
                            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                                <span className="text-lg font-semibold">Corporate Client</span>
                            </div>
                        </div>
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
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                         <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleLogout} tooltip={{children: 'Log Out'}}>
                                <LogOut />
                                <span>Log Out</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <div className="flex flex-col flex-1">
                 <header className="flex h-16 items-center justify-between p-4 border-b md:justify-end bg-card">
                    <div className="flex items-center gap-4">
                         <span className="font-bold hidden max-md:inline-block">Corporate Portal</span>
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

