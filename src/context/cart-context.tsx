
"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { DisplayProduct, CustomizationValue } from '@/lib/types';
import { mockProducts } from '@/lib/mock-data';
import { useUser } from './user-context';

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
    | { type: 'ADD_TO_CART'; payload: { product: DisplayProduct, customizations: { [key: string]: Partial<CustomizationValue> } } }
    | { type: 'REMOVE_FROM_CART'; payload: { instanceId: string } }
    | { type: 'UPDATE_QUANTITY'; payload: { instanceId: string; delta: number } }
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

// Reducer function to manage cart state
const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const hasCustomizations = Object.keys(action.payload.customizations).length > 0;
            const existingItemIndex = state.cartItems.findIndex(item => item.product.id === action.payload.product.id && !hasCustomizations && Object.keys(item.customizations).length === 0);

            if (existingItemIndex !== -1 && !hasCustomizations) {
                // If item exists and has no customizations, just increase quantity
                const updatedCartItems = [...state.cartItems];
                updatedCartItems[existingItemIndex].quantity += 1;
                return { ...state, cartItems: updatedCartItems };
            } else {
                 // Add as a new item if it has customizations or doesn't exist
                const newCartItem: CartItem = {
                    instanceId: `${action.payload.product.id}-${Date.now()}`, // Simple unique ID
                    product: action.payload.product,
                    quantity: 1,
                    customizations: action.payload.customizations,
                };
                return {
                    ...state,
                    cartItems: [...state.cartItems, newCartItem],
                };
            }
        }
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                cartItems: state.cartItems.filter(item => item.instanceId !== action.payload.instanceId),
            };
        case 'UPDATE_QUANTITY': {
            return {
                ...state,
                cartItems: state.cartItems
                    .map(item => {
                        if (item.instanceId === action.payload.instanceId) {
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
    
    // Initial state logic adjusted
    const getInitialState = (): CartState => {
        if (isLoggedIn) {
            const sampleProducts = [mockProducts.find(p => p.id === '1'), mockProducts.find(p => p.id === '4')].filter(Boolean) as DisplayProduct[];
            return {
                cartItems: sampleProducts.map((p, index) => ({
                    instanceId: `${p.id}-${index}`,
                    product: p,
                    quantity: 1,
                    customizations: {},
                })),
            };
        }
        return { cartItems: [] };
    };
    
    const [state, dispatch] = useReducer(cartReducer, getInitialState());

    useEffect(() => {
        if (!isLoggedIn) {
            dispatch({ type: 'CLEAR_CART' });
        }
    }, [isLoggedIn]);

    const addToCart = (payload: { product: DisplayProduct, customizations: { [key: string]: Partial<CustomizationValue> } }) => {
        dispatch({ type: 'ADD_TO_CART', payload });
    };

    const removeFromCart = (instanceId: string) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: { instanceId } });
    };

    const updateQuantity = (instanceId: string, delta: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { instanceId, delta } });
    };

    const subtotal = state.cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
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
