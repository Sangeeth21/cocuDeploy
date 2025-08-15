
"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { DisplayProduct, CustomizationValue } from '@/lib/types';
import { useUser } from './user-context';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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
}

// Define the actions that can be performed on the cart
type CartAction =
    | { type: 'ADD_TO_CART'; payload: CartItem }
    | { type: 'REMOVE_FROM_CART'; payload: { instanceId: string } }
    | { type: 'UPDATE_QUANTITY'; payload: { instanceId: string; quantity: number } }
    | { type: 'SET_CART'; payload: CartItem[] }
    | { type: 'CLEAR_CART' };

// Create the context
interface CartContextType extends CartState {
    addToCart: (payload: { product: DisplayProduct, customizations: { [key: string]: Partial<CustomizationValue> } }) => void;
    removeFromCart: (instanceId: string) => void;
    updateQuantity: (instanceId: string, delta: number) => void;
    subtotal: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART':
            return { ...state, cartItems: [...state.cartItems, action.payload] };
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                cartItems: state.cartItems.filter(item => item.instanceId !== action.payload.instanceId),
            };
        case 'UPDATE_QUANTITY': {
            return {
                ...state,
                cartItems: state.cartItems
                    .map(item => item.instanceId === action.payload.instanceId ? { ...item, quantity: action.payload.quantity } : item)
                    .filter(item => item.quantity > 0),
            };
        }
        case 'SET_CART':
            return { ...state, cartItems: action.payload };
        case 'CLEAR_CART':
            return { ...state, cartItems: [] };
        default:
            return state;
    }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { isLoggedIn, user } = useUser();
    const { toast } = useToast();
    const [state, dispatch] = useReducer(cartReducer, { cartItems: [] });

    // Load cart from Firestore
    useEffect(() => {
        if (isLoggedIn && user?.id) {
            const userDocRef = doc(db, "users", user.id);
            const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    dispatch({ type: 'SET_CART', payload: docSnap.data().cart || [] });
                }
            });
            return () => unsubscribe();
        } else {
            dispatch({ type: 'CLEAR_CART' });
        }
    }, [isLoggedIn, user?.id]);
    
    // Abstract Firestore update logic
    const updateFirestoreCart = async (newCart: CartItem[]) => {
        if (!user?.id) return;
        const userDocRef = doc(db, "users", user.id);
        try {
            await updateDoc(userDocRef, { cart: newCart });
        } catch (error) {
            console.error("Failed to update cart in Firestore:", error);
            toast({ variant: 'destructive', title: "Could not sync your cart." });
        }
    };

    const addToCart = async (payload: { product: DisplayProduct, customizations: { [key: string]: Partial<CustomizationValue> } }) => {
        const { product, customizations } = payload;
        const hasCustomizations = Object.keys(customizations).length > 0;
        const existingItem = !hasCustomizations 
            ? state.cartItems.find(item => item.product.id === product.id && Object.keys(item.customizations).length === 0)
            : null;

        let newCart: CartItem[];
        if (existingItem) {
            newCart = state.cartItems.map(item => 
                item.instanceId === existingItem.instanceId 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            );
        } else {
            const newCartItem: CartItem = {
                instanceId: `${product.id}-${Date.now()}`,
                product,
                quantity: 1,
                customizations,
            };
            newCart = [...state.cartItems, newCartItem];
        }
        dispatch({ type: 'SET_CART', payload: newCart });
        await updateFirestoreCart(newCart);
    };

    const removeFromCart = async (instanceId: string) => {
        const newCart = state.cartItems.filter(item => item.instanceId !== instanceId);
        dispatch({ type: 'SET_CART', payload: newCart });
        await updateFirestoreCart(newCart);
    };

    const updateQuantity = async (instanceId: string, delta: number) => {
        const itemToUpdate = state.cartItems.find(item => item.instanceId === instanceId);
        if (!itemToUpdate) return;
        
        const newQuantity = Math.max(1, itemToUpdate.quantity + delta);
        const newCart = state.cartItems.map(item => 
            item.instanceId === instanceId ? { ...item, quantity: newQuantity } : item
        );
        dispatch({ type: 'SET_CART', payload: newCart });
        await updateFirestoreCart(newCart);
    };

    const subtotal = state.cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const totalItems = state.cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems: state.cartItems, addToCart, removeFromCart, updateQuantity, subtotal, totalItems }}>
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
