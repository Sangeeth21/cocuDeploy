
"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarMenuBadge, useSidebar } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ListChecks, LineChart, MessageSquare, Settings, LogOut, Store, Warehouse, ChevronsLeft, ChevronsRight, Gift, ShieldAlert, LifeBuoy, Gavel, Building, User, Wand2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useVerification } from "@/context/vendor-verification-context";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const personalNavLinks = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/products", label: "Products", icon: Package },
  { href: "/vendor/templates", label: "Templates", icon: Wand2 },
  { href: "/vendor/inventory", label: "Inventory", icon: Warehouse },
  { href: "/vendor/orders", label: "Orders", icon: ListChecks },
  { href: "/vendor/analytics", label: "Analytics", icon: LineChart },
  { href: "/vendor/messages", label: "Messages", icon: MessageSquare, badge: "5" },
  { href: "/vendor/referrals", label: "Referrals", icon: Gift },
  { href: "/vendor/support", label: "Support", icon: LifeBuoy },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
];

const corporateNavLinks = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/products", label: "Corporate Products", icon: Package },
  { href: "/vendor/inventory", label: "Corporate Inventory", icon: Warehouse },
  { href: "/vendor/orders", label: "Corporate Orders", icon: ListChecks },
  { href: "/vendor/bids", label: "Bidding", icon: Gavel },
  { href: "/vendor/templates", label: "Templates", icon: Wand2 },
  { href: "/vendor/analytics", label: "Analytics", icon: LineChart },
  { href: "/vendor/messages", label: "Corporate Messages", icon: MessageSquare, badge: "2" },
  { href: "/vendor/referrals", label: "Referrals", icon: Gift },
  { href: "/vendor/support", label: "Support", icon: LifeBuoy },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
];

const hybridNavLinks = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { 
    id: "products", 
    label: "Products", 
    icon: Package,
    subLinks: [
        { href: "/vendor/products", label: "Personalized", icon: User },
        { href: "/vendor/corporate-products", label: "Corporate", icon: Building },
    ]
  },
  { 
    id: "inventory", 
    label: "Inventory", 
    icon: Warehouse,
    subLinks: [
        { href: "/vendor/inventory", label: "Personalized", icon: User },
        { href: "/vendor/corporate-inventory", label: "Corporate", icon: Building },
    ]
  },
  { 
    id: "orders", 
    label: "Orders", 
    icon: ListChecks,
    subLinks: [
        { href: "/vendor/orders", label: "Personalized", icon: User },
        { href: "/vendor/corporate-orders", label: "Corporate", icon: Building },
    ]
  },
  { href: "/vendor/bids", label: "Bidding", icon: Gavel },
  { href: "/vendor/templates", label: "Templates", icon: Wand2 },
  { href: "/vendor/analytics", label: "Analytics", icon: LineChart },
  { 
    id: "messages", 
    label: "Messages", 
    icon: MessageSquare,
    badge: "7",
    subLinks: [
        { href: "/vendor/messages", label: "Personalized", icon: User, badge: "5" },
        { href: "/vendor/corporate-messages", label: "Corporate", icon: Building, badge: "2" },
    ]
  },
  { href: "/vendor/referrals", label: "Referrals", icon: Gift },
  { href: "/vendor/support", label: "Support", icon: LifeBuoy },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
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

export function VendorSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { vendorType, isVerified } = useVerification();
    const [navLinks, setNavLinks] = useState(personalNavLinks);
    const [vendorTitle, setVendorTitle] = useState("Personal Vendor");

    useEffect(() => {
        switch(vendorType) {
            case 'corporate':
                setNavLinks(corporateNavLinks);
                setVendorTitle("Corporate Vendor");
                break;
            case 'both':
                setNavLinks(hybridNavLinks as any); // Type assertion for simplicity
                setVendorTitle("Hybrid Vendor");
                break;
            case 'personalized':
            default:
                setNavLinks(personalNavLinks);
                setVendorTitle("Personal Vendor");
                break;
        }
    }, [vendorType]);
    
    return (
        <Sidebar collapsible="icon" className="border-r hidden md:flex">
                <SidebarHeader>
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2">
                           <Avatar className="h-10 w-10">
                                <AvatarImage src="https://placehold.co/100x100.png" alt="Vendor Avatar" data-ai-hint="company logo" />
                                <AvatarFallback>V</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                                <span className="text-lg font-semibold">{vendorTitle},</span>
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
                                        <ShieldAlert />
                                        <span>Verify Account</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        <Accordion type="multiple" className="w-full">
                            {navLinks.map((link: any) => (
                                <SidebarMenuItem key={link.id || link.href}>
                                    {link.subLinks ? (
                                        <AccordionItem value={link.id!} className="border-b-0">
                                            <AccordionTrigger asChild>
                                                <SidebarMenuButton
                                                    isActive={pathname.includes(`/${link.id}`)}
                                                    tooltip={{children: link.label}}
                                                >
                                                    <link.icon />
                                                    <span>{link.label}</span>
                                                    {link.badge && <SidebarMenuBadge>{link.badge}</SidebarMenuBadge>}
                                                </SidebarMenuButton>
                                            </AccordionTrigger>
                                            <AccordionContent className="pb-0 pl-4 group-hover:group-data-[collapsible=icon]:pl-0 group-hover:group-data-[collapsible=icon]:ml-0 group-hover:group-data-[collapsible=icon]:px-2">
                                                <SidebarMenu>
                                                    {link.subLinks.map((subLink: any) => (
                                                         <SidebarMenuItem key={subLink.href}>
                                                            <SidebarMenuButton
                                                                asChild
                                                                size="sm"
                                                                isActive={pathname === subLink.href}
                                                                tooltip={{children: subLink.label}}
                                                            >
                                                                <Link href={subLink.href}>
                                                                    <subLink.icon />
                                                                    <span>{subLink.label}</span>
                                                                    {subLink.badge && <SidebarMenuBadge>{subLink.badge}</SidebarMenuBadge>}
                                                                </Link>
                                                            </SidebarMenuButton>
                                                        </SidebarMenuItem>
                                                    ))}
                                                </SidebarMenu>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ) : (
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
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </Accordion>
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
                            <SidebarMenuButton onClick={() => router.push('/vendor/login')}>
                                <LogOut />
                                <span>Log Out</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <CustomSidebarTrigger />
            </Sidebar>
    )
}
