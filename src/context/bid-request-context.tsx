
"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { DisplayProduct } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const BID_REQUEST_STORAGE_KEY = 'shopsphere_bid_request';

export type BidRequestItem = DisplayProduct & { customizationRequestId?: string };

interface BidRequestState {
    bidItems: BidRequestItem[];
}

type BidRequestAction =
    | { type: 'ADD_TO_BID'; payload: BidRequestItem }
    | { type: 'REMOVE_FROM_BID'; payload: { id: string } }
    | { type: 'SET_BID_ITEMS'; payload: BidRequestItem[] }
    | { type: 'CLEAR_BID' };

interface BidRequestContextType extends BidRequestState {
    addToBid: (product: BidRequestItem) => void;
    removeFromBid: (id: string) => void;
    clearBid: () => void;
    isInBid: (id: string) => boolean;
    totalItems: number;
}

const BidRequestContext = createContext<BidRequestContextType | undefined>(undefined);

const bidRequestReducer = (state: BidRequestState, action: BidRequestAction): BidRequestState => {
    switch (action.type) {
        case 'ADD_TO_BID': {
            const existingItem = state.bidItems.find(item => item.id === action.payload.id);
            if (existingItem) return state; // Already in the list

            // Enforce same category rule
            if (state.bidItems.length > 0 && state.bidItems[0].category !== action.payload.category) {
                // The toast logic is handled in the component calling addToBid
                return state;
            }
             if (state.bidItems.length >= 4) {
                return state; // Limit to 4 items
            }

            return {
                ...state,
                bidItems: [...state.bidItems, action.payload],
            };
        }
        case 'REMOVE_FROM_BID':
            return {
                ...state,
                bidItems: state.bidItems.filter(item => item.id !== action.payload.id),
            };
        case 'SET_BID_ITEMS':
            return {
                ...state,
                bidItems: action.payload,
            };
        case 'CLEAR_BID':
            return { ...state, bidItems: [] };
        default:
            return state;
    }
};

export const BidRequestProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(bidRequestReducer, { bidItems: [] });
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedBidRequest = localStorage.getItem(BID_REQUEST_STORAGE_KEY);
            if (storedBidRequest) {
                dispatch({ type: 'SET_BID_ITEMS', payload: JSON.parse(storedBidRequest) });
            }
        } catch (error) {
            console.error("Failed to parse bid request from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(BID_REQUEST_STORAGE_KEY, JSON.stringify(state.bidItems));
        } catch (error) {
            console.error("Failed to save bid request to localStorage", error);
        }
    }, [state.bidItems]);

    const addToBid = (product: BidRequestItem) => {
        if (state.bidItems.length > 0 && state.bidItems[0].category !== product.category) {
            toast({
                variant: 'destructive',
                title: 'Category Mismatch',
                description: 'You can only add products from the same category to a single bid request.',
            });
            return;
        }
         if (state.bidItems.length >= 4) {
            toast({
                variant: 'destructive',
                title: 'Limit Reached',
                description: 'You can only add up to 4 products to a single bid request.',
            });
            return;
        }
        dispatch({ type: 'ADD_TO_BID', payload: product });
        toast({
            title: 'Added to Bid Request',
            description: product.name,
        });
    };

    const removeFromBid = (id: string) => {
        dispatch({ type: 'REMOVE_FROM_BID', payload: { id } });
    };
    
    const clearBid = () => {
        dispatch({ type: 'CLEAR_BID' });
    }

    const isInBid = (id: string) => {
        return state.bidItems.some(item => item.id === id);
    };

    const totalItems = state.bidItems.length;

    return (
        <BidRequestContext.Provider value={{ bidItems: state.bidItems, addToBid, removeFromBid, clearBid, isInBid, totalItems }}>
            {children}
        </BidRequestContext.Provider>
    );
};

export const useBidRequest = () => {
    const context = useContext(BidRequestContext);
    if (context === undefined) {
        throw new Error('useBidRequest must be used within a BidRequestProvider');
    }
    return context;
};
