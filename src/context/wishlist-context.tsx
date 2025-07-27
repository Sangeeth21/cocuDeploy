
"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { DisplayProduct } from '@/lib/types';
import { mockProducts } from '@/lib/mock-data';

const WISHLIST_STORAGE_KEY = 'shopsphere_wishlist';

// Define the shape of a wishlist item
export type WishlistItem = DisplayProduct;

// Define the shape of the wishlist state
interface WishlistState {
    wishlistItems: WishlistItem[];
}

// Define the actions that can be performed on the wishlist
type WishlistAction =
    | { type: 'TOGGLE_WISHLIST'; payload: WishlistItem }
    | { type: 'REMOVE_FROM_WISHLIST'; payload: { id: string } }
    | { type: 'SET_WISHLIST'; payload: WishlistItem[] };

// Create the context
interface WishlistContextType extends WishlistState {
    toggleWishlist: (product: WishlistItem) => void;
    removeFromWishlist: (id: string) => void;
    isWishlisted: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Reducer function to manage wishlist state
const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
    switch (action.type) {
        case 'TOGGLE_WISHLIST': {
            const existingItem = state.wishlistItems.find(item => item.id === action.payload.id);
            if (existingItem) {
                return {
                    ...state,
                    wishlistItems: state.wishlistItems.filter(item => item.id !== action.payload.id),
                };
            }
            return {
                ...state,
                wishlistItems: [...state.wishlistItems, action.payload],
            };
        }
        case 'REMOVE_FROM_WISHLIST':
            return {
                ...state,
                wishlistItems: state.wishlistItems.filter(item => item.id !== action.payload.id),
            };
        case 'SET_WISHLIST':
            return {
                ...state,
                wishlistItems: action.payload,
            };
        default:
            return state;
    }
};

// WishlistProvider component
export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(wishlistReducer, { wishlistItems: [] });

    // Load wishlist from localStorage on initial render
    useEffect(() => {
        try {
            const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
            if (storedWishlist) {
                dispatch({ type: 'SET_WISHLIST', payload: JSON.parse(storedWishlist) });
            } else {
                 // For demonstration, initialize with one item if localStorage is empty
                dispatch({ type: 'SET_WISHLIST', payload: [mockProducts[3]]});
            }
        } catch (error) {
            console.error("Failed to parse wishlist from localStorage", error);
        }
    }, []);

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(state.wishlistItems));
        } catch (error) {
            console.error("Failed to save wishlist to localStorage", error);
        }
    }, [state.wishlistItems]);


    const toggleWishlist = (product: WishlistItem) => {
        dispatch({ type: 'TOGGLE_WISHLIST', payload: product });
    };

    const removeFromWishlist = (id: string) => {
        dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: { id } });
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
