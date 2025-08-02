
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarHeader, useSidebar, SidebarMenuBadge } from "@/components/ui/sidebar";
import { LayoutDashboard, LogOut, Settings, Gavel, Briefcase, Building, Package, FileText, User, ShoppingCart, Scale, PlusCircle } from "lucide-react";
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
    const bannerCampaign = (mockCorporateCampaigns || []).find(c => c.status === 'Active' && c.placement === 'banner');
    
    if (!bannerCampaign) return null;
    
    return (
        <div className="bg-primary text-primary-foreground p-2 text-sm text-center">
            <Link href={`/corporate/products?campaign=${bannerCampaign.id}`} className="hover:underline">
                {bannerCampaign.creatives?.[0].title} - {bannerCampaign.creatives?.[0].description}
            </Link>
        </div>
    )
}

export function CorporateSidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { adminLogout } = useAdminAuth();
    const { totalItems: cartItemsCount } = useCart();
    const { totalItems: comparisonItemsCount } = useComparison();
    const { totalItems: bidItemsCount } = useBidRequest();

    const handleLogout = () => {
        adminLogout();
        router.push('/corporate');
    }

    return (
        <div className="flex min-h-screen bg-background">
        <SidebarProvider defaultOpen={false}>
            <Sidebar 
                collapsible="icon" 
                className="border-r hidden md:flex"
            >
                <SidebarHeader>
                    <div className="flex items-center justify-between p-2">
                        <Link href="/corporate/dashboard" className="flex items-center gap-2">
                           <Avatar className="h-10 w-10">
                               <Building className="h-6 w-6"/>
                            </Avatar>
                            <div className="flex flex-col group-hover:group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:hidden">
                                <span className="text-lg font-semibold">Corporate Client</span>
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
                                            <link.icon />
                                            <span className="group-hover:group-data-[collapsible=icon]:inline-block group-data-[collapsible=icon]:hidden">{link.label}</span>
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
                                <span className="group-hover:group-data-[collapsible=icon]:inline-block group-data-[collapsible=icon]:hidden">Log Out</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <div className="flex flex-col flex-1 w-0">
                 <header className="flex h-16 items-center px-4 border-b bg-card">
                    <Link href="/corporate/dashboard" className="flex items-center gap-2 mr-6">
                        <Store className="h-6 w-6 text-primary" />
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-lg font-headline">ShopSphere</span>
                          <span className="font-bold text-lg font-headline">Corporate</span>
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
                    <CorporateCampaignBanner />
                    <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8">
                        {children}
                    </main>
                    <Footer />
                 </div>
            </div>
        </SidebarProvider>
        </div>
    );
}
