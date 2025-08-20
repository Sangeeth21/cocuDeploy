
"use client";

import { CartProvider } from '@/context/cart-context';
import { UserProvider } from '@/context/user-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { AuthDialogProvider } from '@/context/auth-dialog-context';
import { ComparisonProvider } from '@/context/comparison-context';
import { CorporateAuthDialogProvider } from '@/context/corporate-auth-dialog-context';
import { BidRequestProvider } from '@/context/bid-request-context';
import { AdminAuthProvider } from '@/context/admin-auth-context';

export function Providers({ children, platform = 'personalized' }: { children: React.ReactNode, platform?: 'personalized' | 'corporate' }) {
    return (
        <UserProvider>
            <AuthDialogProvider>
                <AdminAuthProvider>
                    <CorporateAuthDialogProvider>
                        <CartProvider platform={platform}>
                            <WishlistProvider>
                                <ComparisonProvider>
                                    <BidRequestProvider>
                                        {children}
                                    </BidRequestProvider>
                                </ComparisonProvider>
                            </WishlistProvider>
                        </CartProvider>
                    </CorporateAuthDialogProvider>
                </AdminAuthProvider>
            </AuthDialogProvider>
        </UserProvider>
    )
}
