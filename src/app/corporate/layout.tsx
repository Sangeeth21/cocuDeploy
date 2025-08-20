
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CorporateSidebarLayout } from "./_components/corporate-sidebar-layout";
import { AdminAuthProvider, useAdminAuth } from "@/context/admin-auth-context";
import { BidRequestProvider } from "@/context/bid-request-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { MarketingCampaign } from "@/lib/types";
import { CoWorkerChatbot } from "@/components/co-worker-chatbot";
import { Providers } from "@/components/layout/providers";
import { BrandedLoader } from "@/components/branded-loader";


function CorporateCampaignPopup() {
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
            const hasSeenPopup = sessionStorage.getItem(`seen_corporate_popup_${popupCampaign.id}`);
            if (!hasSeenPopup) {
                const timer = setTimeout(() => {
                    setIsOpen(true);
                    sessionStorage.setItem(`seen_corporate_popup_${popupCampaign.id}`, 'true');
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
                            <Link href={`/corporate/products?campaign=${popupCampaign.id}`}>{creative.cta}</Link>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function ProtectedCorporateLayout({ children }: { children: React.ReactNode }) {
  const { isAdminLoggedIn, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until loading is finished before checking auth state
    if (!isLoading && !isAdminLoggedIn && pathname !== '/corporate') {
      router.replace("/corporate");
    }
  }, [isAdminLoggedIn, isLoading, router, pathname]);
  
  if (isLoading) {
    return <BrandedLoader />;
  }

  // The /corporate page is the login page, so it should not have the sidebar layout.
  if (pathname === '/corporate') {
    return <>{children}</>;
  }

  // If logged in, show the sidebar layout. Otherwise, the effect will redirect.
  if (isAdminLoggedIn) {
    return (
      <CorporateSidebarLayout>
        {children}
      </CorporateSidebarLayout>
    );
  }

  // Render a loader or null while redirecting to avoid content flashing
  return <BrandedLoader />;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showChatbot = pathname !== '/corporate' && pathname !== '/corporate/co-worker';

  return (
    <AdminAuthProvider>
        <Providers platform="corporate">
          <ProtectedCorporateLayout>
            {children}
          </ProtectedCorporateLayout>
          <CorporateCampaignPopup />
          {showChatbot && <CoWorkerChatbot />}
        </Providers>
    </AdminAuthProvider>
  );
}
