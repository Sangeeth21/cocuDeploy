
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
  const { isAdminLoggedIn } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  // This check is a placeholder for corporate-specific authentication
  useEffect(() => {
    // If we are on a protected corporate route and not logged in, redirect to the login page.
    if (!isAdminLoggedIn && pathname !== '/corporate') {
      router.replace("/corporate");
    }
  }, [isAdminLoggedIn, router, pathname]);
  
  // The /corporate page is the login page, so it should not have the sidebar layout.
  if (pathname === '/corporate') {
    return <>{children}</>;
  }

  // For any other page inside /corporate/*, if the user is not logged in, we show a loader/null
  // while the useEffect above triggers the redirect.
  if (!isAdminLoggedIn) {
    return null; // Or a loading spinner
  }

  // If logged in and on a protected corporate route, show the sidebar layout.
  return (
    <CorporateSidebarLayout>
      {children}
    </CorporateSidebarLayout>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showChatbot = pathname !== '/corporate' && pathname !== '/corporate/co-worker';

  return (
    <AdminAuthProvider>
        <Providers>
            <BidRequestProvider>
              <ProtectedCorporateLayout>
                {children}
              </ProtectedCorporateLayout>
              <CorporateCampaignPopup />
              {showChatbot && <CoWorkerChatbot />}
            </BidRequestProvider>
        </Providers>
    </AdminAuthProvider>
  );
}
