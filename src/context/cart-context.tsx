
"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import type { DisplayProduct, CustomizationValue } from '@/lib/types';
import { useUser } from './user-context';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';

// Define the shape of a cart item
export type CartItem = {
    instanceId: string; // Unique ID for this specific instance in the cart
    product: DisplayProduct;
    quantity: number;
    customizations: { [key: string]: Partial<CustomizationValue> };
};

// Define the shape of the cart state
interface CartState {
    cartItems: CartItem[];
    loading: boolean;
}

// Define the actions that can be performed on the cart
type CartAction =
    | { type: 'SET_CART'; payload: CartItem[] }
    | { type: 'CLEAR_CART' }
    | { type: 'SET_LOADING'; payload: boolean };

// Create the context
interface CartContextType extends CartState {
    addToCart: (payload: { product: DisplayProduct, customizations: { [key: string]: Partial<CustomizationValue> }, quantity?: number }) => void;
    removeFromCart: (instanceId: string) => void;
    updateQuantity: (instanceId: string, delta: number) => void;
    clearCart: () => Promise<void>;
    subtotal: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'SET_CART':
            return { ...state, cartItems: action.payload };
        case 'CLEAR_CART':
            return { ...state, cartItems: [] };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        default:
            return state;
    }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { isLoggedIn, user, commissionRates } = useUser();
    const { toast } = useToast();
    const pathname = usePathname();
    const [state, dispatch] = useReducer(cartReducer, { cartItems: [], loading: true });
    
    const platform = pathname.startsWith('/corporate') ? 'corporate' : 'personalized';

    // Load cart from Firestore
    useEffect(() => {
        if (isLoggedIn && user?.id) {
            dispatch({ type: 'SET_LOADING', payload: true });
            const userDocRef = doc(db, "users", user.id);
            const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    dispatch({ type: 'SET_CART', payload: docSnap.data().cart || [] });
                }
                dispatch({ type: 'SET_LOADING', payload: false });
            }, (error) => {
                console.error("Failed to listen to cart updates:", error);
                dispatch({ type: 'SET_LOADING', payload: false });
            });
            return () => unsubscribe();
        } else {
            // Handle logged out user (e.g., clear cart or use localStorage)
            dispatch({ type: 'CLEAR_CART' });
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [isLoggedIn, user?.id]);
    
    // Abstract Firestore update logic
    const updateFirestoreCart = async (newCart: CartItem[]) => {
        if (!isLoggedIn || !user?.id) return;
        const userDocRef = doc(db, "users", user.id);
        try {
            await updateDoc(userDocRef, { cart: newCart });
        } catch (error) {
            console.error("Failed to update cart in Firestore:", error);
            toast({ variant: 'destructive', title: "Could not sync your cart." });
        }
    };

    const addToCart = async (payload: { product: DisplayProduct, customizations: { [key: string]: Partial<CustomizationValue> }, quantity?: number }) => {
        if (!isLoggedIn || !user?.id) {
            toast({ variant: 'destructive', title: "Please log in to add items to your cart." });
            return;
        }

        const { product, customizations, quantity = 1 } = payload;
        const userDocRef = doc(db, "users", user.id);

        try {
            // Get current cart from Firestore to ensure we have the latest state
            const docSnap = await getDoc(userDocRef);
            const currentCart: CartItem[] = docSnap.exists() ? docSnap.data().cart || [] : [];
            let newCart: CartItem[];
            
            const moq = product.moq || 1;
            const finalQuantity = product.b2bEnabled ? Math.max(quantity, moq) : quantity;

            // For corporate products, always add as a new item.
            // For personal products, check if an identical non-customized item exists.
            if (product.b2bEnabled) {
                 const newCartItem: CartItem = {
                    instanceId: `${product.id}-${Date.now()}`,
                    product,
                    quantity: finalQuantity,
                    customizations,
                };
                newCart = [...currentCart, newCartItem];
            } else {
                const existingItemIndex = currentCart.findIndex(
                    item => item.product.id === product.id && Object.keys(item.customizations).length === 0
                );

                if (existingItemIndex > -1) {
                    newCart = currentCart.map((item, index) =>
                        index === existingItemIndex
                            ? { ...item, quantity: item.quantity + finalQuantity }
                            : item
                    );
                } else {
                    const newCartItem: CartItem = {
                        instanceId: `${product.id}-${Date.now()}`,
                        product,
                        quantity: finalQuantity,
                        customizations,
                    };
                    newCart = [...currentCart, newCartItem];
                }
            }
            
            // Update Firestore with the new cart
            await updateDoc(userDocRef, { cart: newCart });
            
            // The onSnapshot listener will automatically update the local state.
            toast({ title: "Added to Cart!", description: `${finalQuantity} x ${product.name}` });

        } catch (error) {
            console.error("Failed to add to cart:", error);
            toast({ variant: 'destructive', title: "Could not add item to cart." });
        }
    };

    const removeFromCart = async (instanceId: string) => {
        const newCart = state.cartItems.filter(item => item.instanceId !== instanceId);
        dispatch({ type: 'SET_CART', payload: newCart });
        await updateFirestoreCart(newCart);
    };

    const updateQuantity = async (instanceId: string, delta: number) => {
        const itemToUpdate = state.cartItems.find(item => item.instanceId === instanceId);
        if (!itemToUpdate) return;
        
        const minQuantity = itemToUpdate.product.b2bEnabled ? (itemToUpdate.product.moq || 1) : 1;
        const newQuantity = Math.max(minQuantity, itemToUpdate.quantity + delta);

        const newCart = state.cartItems.map(item => 
            item.instanceId === instanceId ? { ...item, quantity: newQuantity } : item
        );
        dispatch({ type: 'SET_CART', payload: newCart });
        await updateFirestoreCart(newCart);
    };
    
    const clearCart = async () => {
        dispatch({ type: 'CLEAR_CART' });
        await updateFirestoreCart([]);
    }
    
    const cartItemsForCurrentPlatform = state.cartItems.filter(item => {
        return platform === 'corporate' ? item.product.b2bEnabled === true : item.product.b2bEnabled !== true;
    });

    const subtotal = cartItemsForCurrentPlatform.reduce((acc, item) => {
        const productPlatform = item.product.b2bEnabled ? 'corporate' : 'personalized';
        const commissionRule = commissionRates?.[productPlatform]?.[item.product.category];
        let finalPrice = item.product.price;
        if (commissionRule && commissionRule.buffer) {
            if (commissionRule.buffer.type === 'fixed') {
                finalPrice += commissionRule.buffer.value;
            } else {
                finalPrice *= (1 + (commissionRule.buffer.value / 100));
            }
        }
        return acc + finalPrice * item.quantity;
    }, 0);

    const totalItems = cartItemsForCurrentPlatform.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ ...state, cartItems: cartItemsForCurrentPlatform, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
