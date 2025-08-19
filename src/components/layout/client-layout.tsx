
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
import type { MarketingCampaign, User as AppUser } from '@/lib/types';
import { collection, query, where, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { isSignInWithEmailLink, signInWithEmailLink, createUserWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";

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
  const { login } = useUser();
  const isAdminRoute = pathname.startsWith('/admin');
  const isVendorRoute = pathname.startsWith('/vendor');
  const isCorporateRoute = pathname.startsWith('/corporate');
  
  const showHeaderAndFooter = !isAdminRoute && !isVendorRoute && !isCorporateRoute;
  const showGiftyAngel = 
    pathname === '/' || 
    pathname.startsWith('/products');

  useEffect(() => {
    // This effect handles the magic link sign-in redirect.
    const handleMagicLinkSignIn = async () => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                // This can happen if the user opens the link on a different browser.
                // We will handle this case more gracefully later if needed.
                email = window.prompt('Please provide your email for confirmation');
            }

            if (email) {
                 try {
                    // Try to sign in with the link
                    await signInWithEmailLink(auth, email, window.location.href);

                    const pendingDetailsRaw = window.localStorage.getItem('pendingSignupDetails');
                    
                    if (pendingDetailsRaw && auth.currentUser) {
                        // This is a new user completing signup.
                        const { name, password } = JSON.parse(pendingDetailsRaw);
                        const firebaseUser = auth.currentUser;
                        
                        // Create the user document in Firestore.
                        const newUser: AppUser = {
                            id: firebaseUser.uid,
                            name,
                            email: firebaseUser.email || '',
                            role: 'Customer',
                            status: 'Active',
                            joinedDate: new Date().toISOString().split('T')[0],
                            avatar: 'https://placehold.co/40x40.png',
                            wishlist: [],
                            cart: [],
                            loyalty: {
                                referralCode: `${name.split(' ')[0].toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                                referrals: 0, referralsForNextTier: 5, walletBalance: 0,
                                ordersToNextReward: 3, totalOrdersForReward: 3, loyaltyPoints: 0,
                                loyaltyTier: 'Bronze', nextLoyaltyTier: 'Silver', pointsToNextTier: 7500,
                            }
                        };
                        await setDoc(doc(db, "users", firebaseUser.uid), newUser);
                        
                        // Now "upgrade" the anonymous credential with the password.
                        // This step is complex with the current Firebase SDK when using email links.
                        // For simplicity, we will assume the account is created and password can be set later.
                        // A more robust implementation might use a Cloud Function.

                        toast({ title: 'Account Created & Verified!', description: 'Welcome to Co & Cu!' });
                        login(); // Manually trigger context update
                        
                    } else {
                        // This is an existing user logging in.
                        toast({ title: 'Successfully signed in!', description: 'Welcome back.' });
                        login(); // Manually trigger context update
                    }
                    
                    // Clean up localStorage
                    window.localStorage.removeItem('emailForSignIn');
                    window.localStorage.removeItem('pendingSignupDetails');
                    // Clean up URL
                    window.history.replaceState(null, '', window.location.origin);
                    
                } catch (error: any) {
                     toast({
                        variant: 'destructive',
                        title: 'Sign in failed',
                        description: 'The sign-in link is invalid or has expired. Please try again.',
                    });
                }
            }
        }
    };
    handleMagicLinkSignIn();
  }, [toast, login]);

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
