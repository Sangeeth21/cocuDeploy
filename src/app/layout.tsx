
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

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

// Using a client component to conditionally render layout based on pathname
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminOrVendorRoute = pathname.startsWith('/admin') || pathname.startsWith('/vendor');

  // Metadata can't be in a client component, so we define it here before returning the JSX.
  // This is a simplified approach. For dynamic metadata, further setup would be needed.
  if (typeof window === 'undefined') {
    // Faux metadata for server render. Real metadata would be in a parent Server Component if possible.
  }


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
              {!isAdminOrVendorRoute && <Header />}
              <main className="flex-1">{children}</main>
              {!isAdminOrVendorRoute && <Footer />}
              <Toaster />
            </WishlistProvider>
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
