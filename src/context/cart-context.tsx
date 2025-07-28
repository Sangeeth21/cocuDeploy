
"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { DisplayProduct } from '@/lib/types';
import { mockProducts } from '@/lib/mock-data';
import { useUser } from './user-context';

// Define the shape of a cart item
export type CartItem = DisplayProduct & {
    quantity: number;
};

// Define the shape of the cart state
interface CartState {
    cartItems: CartItem[];
}

// Define the actions that can be performed on the cart
type CartAction =
    | { type: 'ADD_TO_CART'; payload: DisplayProduct }
    | { type: 'REMOVE_FROM_CART'; payload: { id: string } }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; delta: number } }
    | { type: 'CLEAR_CART' };

// Create the context
interface CartContextType extends CartState {
    addToCart: (product: DisplayProduct) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    subtotal: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Reducer function to manage cart state
const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const existingItem = state.cartItems.find(item => item.id === action.payload.id);
            if (existingItem) {
                // If item exists, just increase quantity
                return {
                    ...state,
                    cartItems: state.cartItems.map(item =>
                        item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
                    ),
                };
            }
            // If item does not exist, add it to the cart
            return {
                ...state,
                cartItems: [...state.cartItems, { ...action.payload, quantity: 1 }],
            };
        }
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                cartItems: state.cartItems.filter(item => item.id !== action.payload.id),
            };
        case 'UPDATE_QUANTITY': {
            return {
                ...state,
                cartItems: state.cartItems
                    .map(item => {
                        if (item.id === action.payload.id) {
                            return { ...item, quantity: Math.max(0, item.quantity + action.payload.delta) };
                        }
                        return item;
                    })
                    .filter(item => item.quantity > 0), // Remove item if quantity is 0
            };
        }
        case 'CLEAR_CART':
            return { ...state, cartItems: [] };
        default:
            return state;
    }
};

// CartProvider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { isLoggedIn } = useUser();
    const initialState: CartState = {
        // Initialize with a couple of products for demonstration only if logged in
        cartItems: isLoggedIn ? mockProducts.slice(0, 2).map(p => ({ ...p, quantity: 1 })) : []
    };
    
    const [state, dispatch] = useReducer(cartReducer, initialState);

    useEffect(() => {
        if (!isLoggedIn) {
            dispatch({ type: 'CLEAR_CART' });
        }
    }, [isLoggedIn]);

    const addToCart = (product: DisplayProduct) => {
        dispatch({ type: 'ADD_TO_CART', payload: product });
    };

    const removeFromCart = (id: string) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
    };

    const updateQuantity = (id: string, delta: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, delta } });
    };

    const subtotal = state.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalItems = state.cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems: state.cartItems, addToCart, removeFromCart, updateQuantity, subtotal, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use the cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
