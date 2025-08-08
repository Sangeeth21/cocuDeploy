

"use client";

import { 
    PT_Sans, Roboto, Lato, Montserrat, Oswald, Playfair_Display, Merriweather, 
    Lobster, Pacifico, Inconsolata, Dancing_Script, Poppins, Nunito_Sans, Raleway, 
    Rubik, Work_Sans, Lora, Cormorant_Garamond, Bitter, Arvo, Anton, Bebas_Neue, 
    Alfa_Slab_One, Caveat, Satisfy, Sacramento, JetBrains_Mono 
} from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { CartProvider } from '@/context/cart-context';
import { UserProvider } from '@/context/user-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { usePathname } from 'next/navigation';
import { mockCampaigns, mockCorporateCampaigns } from "@/lib/mock-data";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Image from 'next/image';
import { AuthDialogProvider } from '@/context/auth-dialog-context';
import { CustomerAuthDialog } from '@/components/customer-auth-dialog';
import { app } from '@/lib/firebase';
import { PageLoader } from '@/components/page-loader';
import { BrandedLoader } from '@/components/branded-loader';
import { ComparisonProvider } from '@/context/comparison-context';

// Existing Fonts
const ptSans = PT_Sans({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-pt-sans' });
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-roboto' });
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato' });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-montserrat' });
const oswald = Oswald({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-oswald' });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-playfair-display' });
const merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-merriweather' });
const lobster = Lobster({ subsets: ['latin'], weight: ['400'], variable: '--font-lobster' });
const pacifico = Pacifico({ subsets: ['latin'], weight: ['400'], variable: '--font-pacifico' });
const inconsolata = Inconsolata({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-inconsolata' });
const dancingScript = Dancing_Script({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-dancing-script' });

// New Fonts
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-poppins' });
const nunitoSans = Nunito_Sans({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-nunito-sans' });
const raleway = Raleway({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-raleway' });
const rubik = Rubik({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-rubik' });
const workSans = Work_Sans({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-work-sans' });
const lora = Lora({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lora' });
const cormorantGaramond = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cormorant-garamond' });
const bitter = Bitter({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-bitter' });
const arvo = Arvo({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-arvo' });
const anton = Anton({ subsets: ['latin'], weight: ['400'], variable: '--font-anton' });
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: ['400'], variable: '--font-bebas-neue' });
const alfaSlabOne = Alfa_Slab_One({ subsets: ['latin'], weight: ['400'], variable: '--font-alfa-slab-one' });
const caveat = Caveat({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-caveat' });
const satisfy = Satisfy({ subsets: ['latin'], weight: ['400'], variable: '--font-satisfy' });
const sacramento = Sacramento({ subsets: ['latin'], weight: ['400'], variable: '--font-sacramento' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-jetbrains-mono' });


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
  const isVendorRoute = pathname.startsWith('/vendor');
  const isCorporateRoute = pathname.startsWith('/corporate');
  
  const showHeaderAndFooter = !isAdminRoute && !isVendorRoute && !isCorporateRoute;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Co & Cu</title>
        <meta name="description" content="Your one-stop online marketplace." />
      </head>
      <body className={cn(
          'min-h-screen bg-background font-body antialiased flex flex-col', 
          ptSans.variable, roboto.variable, lato.variable, montserrat.variable, 
          oswald.variable, playfairDisplay.variable, merriweather.variable, 
          lobster.variable, pacifico.variable, inconsolata.variable, dancingScript.variable,
          poppins.variable, nunitoSans.variable, raleway.variable, rubik.variable,
          workSans.variable, lora.variable, cormorantGaramond.variable, bitter.variable,
          arvo.variable, anton.variable, bebasNeue.variable, alfaSlabOne.variable,
          caveat.variable, satisfy.variable, sacramento.variable, jetbrainsMono.variable
        )}>
        <BrandedLoader />
        <PageLoader />
        <UserProvider>
          <AuthDialogProvider>
            <CartProvider>
              <WishlistProvider>
                <ComparisonProvider>
                  {showHeaderAndFooter && (
                    <>
                      <CampaignBanner />
                      <Header />
                    </>
                  )}
                  <main className="flex-1">{children}</main>
                  {showHeaderAndFooter && (
                    <>
                      <Footer />
                      <CampaignPopup />
                    </>
                  )}
                  <CustomerAuthDialog />
                  <Toaster />
                  </ComparisonProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthDialogProvider>
        </UserProvider>
      </body>
    </html>
  );
}
