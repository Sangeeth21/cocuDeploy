
"use client";

import { CartProvider } from '@/context/cart-context';
import { UserProvider } from '@/context/user-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { AuthDialogProvider } from '@/context/auth-dialog-context';
import { ComparisonProvider } from '@/context/comparison-context';
import { CorporateAuthDialogProvider } from '@/context/corporate-auth-dialog-context';
import { BidRequestProvider } from '@/context/bid-request-context';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <AuthDialogProvider>
                <CorporateAuthDialogProvider>
                    <CartProvider>
                        <WishlistProvider>
                            <ComparisonProvider>
                                <BidRequestProvider>
                                    {children}
                                </BidRequestProvider>
                            </ComparisonProvider>
                        </WishlistProvider>
                    </CartProvider>
                </CorporateAuthDialogProvider>
            </AuthDialogProvider>
        </UserProvider>
    )
}
