
"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { DisplayProduct, User } from '@/lib/types';
import { useUser } from './user-context';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

// Define the shape of a wishlist item
export type WishlistItem = DisplayProduct;

// Define the shape of the wishlist state
interface WishlistState {
    wishlistItems: WishlistItem[];
}

// Define the actions that can be performed on the wishlist
type WishlistAction =
    | { type: 'SET_WISHLIST'; payload: WishlistItem[] }
    | { type: 'CLEAR_WISHLIST' };

// Create the context
interface WishlistContextType extends WishlistState {
    toggleWishlist: (product: WishlistItem) => Promise<void>;
    removeFromWishlist: (id: string) => Promise<void>;
    isWishlisted: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Reducer function to manage wishlist state
const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
    switch (action.type) {
        case 'SET_WISHLIST':
            return {
                ...state,
                wishlistItems: action.payload,
            };
        case 'CLEAR_WISHLIST':
            return { ...state, wishlistItems: [] };
        default:
            return state;
    }
};

// WishlistProvider component
export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const { isLoggedIn, user } = useUser();
    const { toast } = useToast();
    const [state, dispatch] = useReducer(wishlistReducer, { wishlistItems: [] });

    // Load wishlist from user document in Firestore
    useEffect(() => {
        if (isLoggedIn && user?.id) {
            const userDocRef = doc(db, "users", user.id);
            const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    // Assuming wishlist is an array of product objects
                    dispatch({ type: 'SET_WISHLIST', payload: docSnap.data().wishlist || [] });
                }
            });
            return () => unsubscribe();
        } else {
            dispatch({ type: 'CLEAR_WISHLIST' });
        }
    }, [isLoggedIn, user?.id]);


    const toggleWishlist = async (product: WishlistItem) => {
        if (!isLoggedIn || !user?.id) return;
        
        const userDocRef = doc(db, "users", user.id);
        const isCurrentlyWishlisted = state.wishlistItems.some(item => item.id === product.id);

        try {
            if (isCurrentlyWishlisted) {
                await updateDoc(userDocRef, {
                    wishlist: arrayRemove(product)
                });
                toast({ title: "Removed from Wishlist", description: product.name });
            } else {
                await updateDoc(userDocRef, {
                    wishlist: arrayUnion(product)
                });
                toast({ title: "Added to Wishlist", description: product.name });
            }
        } catch (error) {
            console.error("Error toggling wishlist:", error);
            toast({ variant: 'destructive', title: "Could not update wishlist." });
        }
    };

    const removeFromWishlist = async (id: string) => {
        if (!isLoggedIn || !user?.id) return;
        const productToRemove = state.wishlistItems.find(item => item.id === id);
        if (!productToRemove) return;
        
        const userDocRef = doc(db, "users", user.id);
        try {
            await updateDoc(userDocRef, {
                wishlist: arrayRemove(productToRemove)
            });
            toast({ title: "Removed from Wishlist", description: productToRemove.name });
        } catch(error) {
             console.error("Error removing from wishlist:", error);
            toast({ variant: 'destructive', title: "Could not update wishlist." });
        }
    };

    const isWishlisted = (id: string) => {
        return state.wishlistItems.some(item => item.id === id);
    }

    return (
        <WishlistContext.Provider value={{ wishlistItems: state.wishlistItems, toggleWishlist, removeFromWishlist, isWishlisted }}>
            {children}
        </WishlistContext.Provider>
    );
};

// Custom hook to use the wishlist context
export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
