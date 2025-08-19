
"use client";

import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { usePathname } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CustomerAuthDialog } from '@/components/customer-auth-dialog';
import { PageLoader } from '@/components/page-loader';
import { BrandedLoader } from '@/components/branded-loader';
import { CorporateAuthDialog } from '@/components/corporate-auth-dialog';
import { GiftyAngelChatbot } from '@/components/gifty-angel-chatbot';
import type { MarketingCampaign } from '@/lib/types';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";


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
  const { toast } = useToast();
  const isAdminRoute = pathname.startsWith('/admin');
  const isVendorRoute = pathname.startsWith('/vendor');
  const isCorporateRoute = pathname.startsWith('/corporate');
  
  const showHeaderAndFooter = !isAdminRoute && !isVendorRoute && !isCorporateRoute;
  const showGiftyAngel = 
    pathname === '/' || 
    pathname.startsWith('/products');

  useEffect(() => {
    // This effect handles the magic link sign-in redirect.
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            email = window.prompt('Please provide your email for confirmation');
        }
        if (email) {
            signInWithEmailLink(auth, email, window.location.href)
                .then((result) => {
                    window.localStorage.removeItem('emailForSignIn');
                    toast({ title: 'Successfully signed in!', description: 'Welcome back.' });
                })
                .catch((error) => {
                    toast({
                        variant: 'destructive',
                        title: 'Sign in failed',
                        description: 'The sign-in link is invalid or has expired. Please try again.',
                    });
                });
        }
    }
  }, [toast]);

  return (
    <>
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
    </>
  );
}
