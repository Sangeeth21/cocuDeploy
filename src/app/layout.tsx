

"use client";

import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { CartProvider } from '@/context/cart-context';
import { UserProvider } from '@/context/user-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { usePathname } from 'next/navigation';
import { mockCampaigns } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Image from 'next/image';
import { AuthDialogProvider } from '@/context/auth-dialog-context';
import { CustomerAuthDialog } from '@/components/customer-auth-dialog';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

function CampaignBanner() {
    const bannerCampaign = mockCampaigns.find(c => c.status === 'Active' && c.placement === 'banner');
    
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
    const popupCampaign = mockCampaigns.find(c => c.status === 'Active' && c.placement === 'popup');

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


// Using a client component to conditionally render layout based on pathname
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const isVendorAuthRoute = pathname.startsWith('/vendor/login') || pathname.startsWith('/vendor/signup') || pathname.startsWith('/vendor/verify');
  
  const showHeaderAndFooter = !isAdminRoute && !isVendorAuthRoute;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>ShopSphere</title>
        <meta name="description" content="Your one-stop online marketplace." />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased flex flex-col', ptSans.variable)}>
        <UserProvider>
          <CartProvider>
            <WishlistProvider>
              <AuthDialogProvider>
                {showHeaderAndFooter && <CampaignBanner />}
                {showHeaderAndFooter && <Header />}
                <main className="flex-1">{children}</main>
                {showHeaderAndFooter && <Footer />}
                {showHeaderAndFooter && <CampaignPopup />}
                <CustomerAuthDialog />
                <Toaster />
              </AuthDialogProvider>
            </WishlistProvider>
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
