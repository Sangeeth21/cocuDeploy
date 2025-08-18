
"use client";

import { CartProvider } from '@/context/cart-context';
import { UserProvider } from '@/context/user-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { AuthDialogProvider } from '@/context/auth-dialog-context';
import { ComparisonProvider } from '@/context/comparison-context';
import { CorporateAuthDialogProvider } from '@/context/corporate-auth-dialog-context';
import { AdminAuthProvider } from '@/context/admin-auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <AdminAuthProvider>
                <AuthDialogProvider>
                    <CorporateAuthDialogProvider>
                        <CartProvider>
                            <WishlistProvider>
                                <ComparisonProvider>
                                    {children}
                                </ComparisonProvider>
                            </WishlistProvider>
                        </CartProvider>
                    </CorporateAuthDialogProvider>
                </AuthDialogProvider>
            </AdminAuthProvider>
        </UserProvider>
    )
}
