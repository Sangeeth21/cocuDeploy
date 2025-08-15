
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarMenuBadge, useSidebar } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ListChecks, LineChart, MessageSquare, Settings, LogOut, Store, Warehouse, ChevronsLeft, ChevronsRight, Gift, ShieldAlert, LifeBuoy, Gavel, Wand2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useVerification } from "@/context/vendor-verification-context";
import { NotificationPopover } from "@/components/notification-popover";
import { mockVendorActivity } from "@/lib/mock-data";

const navLinks = [
  { href: "/vendor/corporate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/corporate/products", label: "Corporate Products", icon: Package },
  { href: "/vendor/templates", label: "Templates", icon: Wand2 },
  { href: "/vendor/corporate/inventory", label: "Inventory", icon: Warehouse },
  { href: "/vendor/corporate/orders", label: "Corporate Orders", icon: ListChecks },
  { href: "/vendor/corporate/bids", label: "Bidding", icon: Gavel },
  { href: "/vendor/corporate/analytics", label: "Analytics", icon: LineChart },
  { href: "/vendor/corporate/messages", label: "Corporate Messages", icon: MessageSquare, badge: "2" },
  { href: "/vendor/corporate/referrals", label: "Referrals", icon: Gift },
  { href: "/vendor/corporate/support", label: "Support", icon: LifeBuoy },
  { href: "/vendor/corporate/settings", label: "Settings", icon: Settings },
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

export function VendorSidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isVerified } = useVerification();

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
                            <div className="flex flex-col group-data-[state=collapsed]:hidden">
                                <span className="text-lg font-semibold">Corporate Vendor,</span>
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
                                        <ShieldAlert className="h-5 w-5" />
                                        <span>Verify Account</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {navLinks.map(link => (
                            <SidebarMenuItem key={link.href}>
                                <SidebarMenuButton 
                                    asChild
                                    isActive={pathname.startsWith(link.href)}
                                    tooltip={{children: link.label}}
                                >
                                    <Link href={link.href}>
                                        <link.icon className="h-5 w-5" />
                                        <span className="group-data-[state=collapsed]:hidden">{link.label}</span>
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
                                    <Store className="h-5 w-5" />
                                    <span className="group-data-[state=collapsed]:hidden">Back to Store</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={{children: 'Log Out'}}>
                                <Link href="/vendor/login">
                                    <LogOut className="h-5 w-5" />
                                    <span className="group-data-[state=collapsed]:hidden">Log Out</span>
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
                        <span className="font-bold hidden max-md:inline-block">Corporate Vendor Portal</span>
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
