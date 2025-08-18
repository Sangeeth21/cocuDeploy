
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarHeader, useSidebar, SidebarMenuBadge, SidebarInset } from "@/components/ui/sidebar";
import { LayoutDashboard, LogOut, Settings, Gavel, Briefcase, Building, Package, FileText, User, ShoppingCart, Scale, PlusCircle, ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/context/admin-auth-context";
import { mockCorporateCampaigns, mockCorporateActivity } from "@/lib/mock-data";
import { Footer } from "@/components/layout/footer";
import { Store } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useComparison } from "@/context/comparison-context";
import { NotificationPopover } from "@/components/notification-popover";
import { SearchBar } from "@/components/search-bar";
import { ComparisonPreview } from "@/components/comparison-preview";
import { BidPreview } from "@/components/bid-preview";
import { useBidRequest } from "@/context/bid-request-context";


const navLinks = [
  { href: "/corporate/dashboard", label: "Marketplace", icon: Building },
  { href: "/corporate/products", label: "Products", icon: Package },
  { href: "/corporate/bids/new", label: "Create Bid", icon: PlusCircle, id: 'bid' },
  { href: "/cart", label: "Cart", icon: ShoppingCart, id: "cart" },
  { href: "/corporate/compare", label: "Compare", icon: Scale, id: "compare" },
  { href: "/corporate/bids", label: "Active Bids", icon: Gavel },
  { href: "/corporate/orders", label: "Order History", icon: Briefcase },
  { href: "/corporate/quotes", label: "My Quotes", icon: FileText },
  { href: "/corporate/account", label: "Account", icon: User },
  { href: "/corporate/settings", label: "Settings", icon: Settings },
];

function CorporateCampaignBanner() {
    const bannerCampaign = (mockCorporateCampaigns || []).find(c => c.status === 'Active' && c.placement === 'corporate-banner' && c.creatives && c.creatives.length > 0);
    
    if (!bannerCampaign) return null;
    
    return (
        <div className="bg-primary text-primary-foreground p-2 text-sm text-center">
            <Link href={`/corporate/products?campaign=${bannerCampaign.id}`} className="hover:underline">
                {bannerCampaign.creatives![0].title} - {bannerCampaign.creatives![0].description}
            </Link>
        </div>
    )
}

function CorporateSidebarLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { adminLogout } = useAdminAuth();
    const { totalItems: cartItemsCount } = useCart();
    const { totalItems: comparisonItemsCount } = useComparison();
    const { totalItems: bidItemsCount } = useBidRequest();
    const { open } = useSidebar();


    const handleLogout = () => {
        adminLogout();
        router.push('/corporate');
    }

    return (
        <>
            <Sidebar 
                collapsible="icon"
            >
                <SidebarHeader>
                    <div className="flex items-center justify-between p-2">
                        <Link href="/corporate/dashboard" className="flex items-center gap-2">
                           <Avatar className="h-10 w-10">
                               <Building className="h-6 w-6"/>
                            </Avatar>
                            <div className={cn("flex flex-col", !open && "hidden")}>
                                <span className="text-lg font-semibold whitespace-nowrap">Corporate Client</span>
                            </div>
                        </Link>
                    </div>
                </SidebarHeader>
                <SidebarContent className="p-2">
                     <SidebarMenu>
                        {navLinks.map(link => {
                            let badgeContent: string | undefined;
                            if (link.id === 'cart' && cartItemsCount > 0) {
                                badgeContent = cartItemsCount.toString();
                            } else if (link.id === 'compare' && comparisonItemsCount > 0) {
                                badgeContent = comparisonItemsCount.toString();
                            } else if (link.id === 'bid' && bidItemsCount > 0) {
                                badgeContent = bidItemsCount.toString();
                            }
                            
                            return (
                                <SidebarMenuItem key={link.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/corporate/dashboard")}
                                        tooltip={{children: link.label}}
                                    >
                                        <Link href={link.href}>
                                            <link.icon className="h-5 w-5" />
                                            <span className={cn(!open && "hidden")}>{link.label}</span>
                                             {badgeContent && <SidebarMenuBadge>{badgeContent}</SidebarMenuBadge>}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                         <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleLogout} tooltip={{children: 'Log Out'}}>
                                <LogOut />
                                <span className={cn(!open && "hidden")}>Log Out</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <CorporateCampaignBanner />
                 <header className="flex h-16 items-center px-4 border-b bg-card">
                    <Link href="/corporate/dashboard" className="flex items-center gap-2 mr-6">
                        <Store className="h-6 w-6 text-primary" />
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-lg font-headline">Co & Cu Corporate</span>
                        </div>
                    </Link>
                    <div className="flex-1 flex justify-center px-4">
                        <div className="w-full max-w-xl">
                            <SearchBar />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <BidPreview />
                         <ComparisonPreview />
                         <NotificationPopover notifications={mockCorporateActivity} />
                    </div>
                 </header>
                 <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8">
                        {children}
                    </main>
                    <Footer />
                 </div>
            </SidebarInset>
        </>
    )
}

export function CorporateSidebarLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-background">
            <SidebarProvider defaultOpen={true}>
                <CorporateSidebarLayoutContent>
                    {children}
                </CorporateSidebarLayoutContent>
            </SidebarProvider>
        </div>
    );
}
