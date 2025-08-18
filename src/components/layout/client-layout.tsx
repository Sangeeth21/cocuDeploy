
"use client";

import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartProvider } from '@/context/cart-context';
import { UserProvider } from '@/context/user-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { usePathname } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AuthDialogProvider } from '@/context/auth-dialog-context';
import { CustomerAuthDialog } from '@/components/customer-auth-dialog';
import { PageLoader } from '@/components/page-loader';
import { BrandedLoader } from '@/components/branded-loader';
import { ComparisonProvider } from '@/context/comparison-context';
import { CorporateAuthDialog } from '@/components/corporate-auth-dialog';
import { AdminAuthProvider } from '@/context/admin-auth-context';
import { CorporateAuthDialogProvider } from '@/context/corporate-auth-dialog-context';
import { GiftyAngelChatbot } from '@/components/gifty-angel-chatbot';
import type { MarketingCampaign } from '@/lib/types';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";


function CampaignBanner() {
    const [bannerCampaign, setBannerCampaign] = useState<MarketingCampaign | null>(null);

    useEffect(() => {
        const campaignsQuery = query(collection(db, "marketingCampaigns"), where("status", "==", "Active"), where("placement", "==", "banner"));
        const unsub = onSnapshot(campaignsQuery, (snapshot) => {
             if (!snapshot.empty) {
                const campaign = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as MarketingCampaign;
                setBannerCampaign(campaign);
            } else {
                setBannerCampaign(null);
            }
        });
        return () => unsub();
    }, []);
    
    if (!bannerCampaign) return null;
    
    return (
        <div className="bg-primary text-primary-foreground p-2 text-sm text-center">
            <Link href={`/products?campaign=${bannerCampaign.id}`} className="hover:underline">
                {bannerCampaign.creatives?.[0].title} - {bannerCampaign.creatives?.[0].description}
            </Link>
        </div>
    )
}

function CampaignPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [popupCampaign, setPopupCampaign] = useState<MarketingCampaign | null>(null);

    useEffect(() => {
        const campaignsQuery = query(collection(db, "marketingCampaigns"), where("status", "==", "Active"), where("placement", "==", "popup"));
        const unsubCampaigns = onSnapshot(campaignsQuery, (snapshot) => {
            if (!snapshot.empty) {
                const campaign = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as MarketingCampaign;
                setPopupCampaign(campaign);
            }
        });
        return () => unsubCampaigns();
    }, []);

    useEffect(() => {
        if (popupCampaign) {
            const hasSeenPopup = sessionStorage.getItem(`seen_popup_${popupCampaign.id}`);
            if (!hasSeenPopup) {
                const timer = setTimeout(() => {
                    setIsOpen(true);
                    sessionStorage.setItem(`seen_popup_${popupCampaign.id}`, 'true');
                }, 3000); // Show popup after 3 seconds
                return () => clearTimeout(timer);
            }
        }
    }, [popupCampaign]);
    
    if (!popupCampaign || !popupCampaign.creatives || popupCampaign.creatives.length === 0) {
        return null;
    }

    const creative = popupCampaign.creatives[0];
    
    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="p-0 overflow-hidden">
                <div className="flex flex-col items-center text-center">
                    {creative.imageUrl && (
                        <div className="relative w-full aspect-video">
                            <Image src={creative.imageUrl} alt={creative.title} fill className="object-cover" />
                        </div>
                    )}
                    <div className="p-6">
                        <DialogTitle className="text-xl font-headline mb-2">{creative.title}</DialogTitle>
                        <DialogDescription>{creative.description}</DialogDescription>
                        <Button asChild className="mt-4">
                            <Link href={`/products?campaign=${popupCampaign.id}`}>{creative.cta}</Link>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const isVendorRoute = pathname.startsWith('/vendor');
  const isCorporateRoute = pathname.startsWith('/corporate');
  
  const showHeaderAndFooter = !isAdminRoute && !isVendorRoute && !isCorporateRoute;
  const showGiftyAngel = 
    pathname === '/' || 
    pathname.startsWith('/products');

  return (
    <UserProvider>
      <AdminAuthProvider>
        <AuthDialogProvider>
            <CorporateAuthDialogProvider>
                <CartProvider>
                <WishlistProvider>
                    <ComparisonProvider>
                    {showHeaderAndFooter && (
                        <>
                        <CampaignBanner />
                        <Header />
                        </>
                    )}
                    <BrandedLoader />
                    <PageLoader />
                    <main className="flex-1">
                        {children}
                    </main>
                    {showHeaderAndFooter && (
                        <>
                        <Footer />
                        <CampaignPopup />
                        </>
                    )}
                    {showHeaderAndFooter && showGiftyAngel && <GiftyAngelChatbot />}
                    <CustomerAuthDialog />
                    <CorporateAuthDialog />
                    <Toaster />
                    </ComparisonProvider>
                </WishlistProvider>
                </CartProvider>
            </CorporateAuthDialogProvider>
        </AuthDialogProvider>
      </AdminAuthProvider>
    </UserProvider>
  );
}
