
"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { DisplayProduct } from '@/lib/types';
import { useUser } from './user-context';

const COMPARISON_STORAGE_KEY = 'shopsphere_comparison';

export type ComparisonItem = DisplayProduct;

interface ComparisonState {
    comparisonItems: ComparisonItem[];
}

type ComparisonAction =
    | { type: 'TOGGLE_COMPARE'; payload: ComparisonItem }
    | { type: 'REMOVE_FROM_COMPARE'; payload: { id: string } }
    | { type: 'SET_COMPARISON'; payload: ComparisonItem[] }
    | { type: 'CLEAR_COMPARISON' };

interface ComparisonContextType extends ComparisonState {
    toggleCompare: (product: ComparisonItem) => void;
    removeFromCompare: (id: string) => void;
    clearComparison: () => void;
    isComparing: (id: string) => boolean;
    totalItems: number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const comparisonReducer = (state: ComparisonState, action: ComparisonAction): ComparisonState => {
    switch (action.type) {
        case 'TOGGLE_COMPARE': {
            const existingItem = state.comparisonItems.find(item => item.id === action.payload.id);
            if (existingItem) {
                return {
                    ...state,
                    comparisonItems: state.comparisonItems.filter(item => item.id !== action.payload.id),
                };
            }
            if (state.comparisonItems.length >= 4) {
                // Optionally add a toast message here to inform the user
                return state; // Limit to 4 items
            }
            return {
                ...state,
                comparisonItems: [...state.comparisonItems, action.payload],
            };
        }
        case 'REMOVE_FROM_COMPARE':
            return {
                ...state,
                comparisonItems: state.comparisonItems.filter(item => item.id !== action.payload.id),
            };
        case 'SET_COMPARISON':
            return {
                ...state,
                comparisonItems: action.payload,
            };
        case 'CLEAR_COMPARISON':
            return { ...state, comparisonItems: [] };
        default:
            return state;
    }
};

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
    const { isLoggedIn } = useUser();
    const [state, dispatch] = useReducer(comparisonReducer, { comparisonItems: [] });

    // Load comparison list from localStorage on initial render
    useEffect(() => {
        try {
            const storedComparison = localStorage.getItem(COMPARISON_STORAGE_KEY);
            if (storedComparison) {
                dispatch({ type: 'SET_COMPARISON', payload: JSON.parse(storedComparison) });
            }
        } catch (error) {
            console.error("Failed to parse comparison from localStorage", error);
        }
    }, []);

    // Save comparison list to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(state.comparisonItems));
        } catch (error) {
            console.error("Failed to save comparison to localStorage", error);
        }
    }, [state.comparisonItems]);

    const toggleCompare = (product: ComparisonItem) => {
        dispatch({ type: 'TOGGLE_COMPARE', payload: product });
    };

    const removeFromCompare = (id: string) => {
        dispatch({ type: 'REMOVE_FROM_COMPARE', payload: { id } });
    };
    
    const clearComparison = () => {
        dispatch({ type: 'CLEAR_COMPARISON' });
    }

    const isComparing = (id: string) => {
        return state.comparisonItems.some(item => item.id === id);
    };

    const totalItems = state.comparisonItems.length;

    return (
        <ComparisonContext.Provider value={{ comparisonItems: state.comparisonItems, toggleCompare, removeFromCompare, clearComparison, isComparing, totalItems }}>
            {children}
        </ComparisonContext.Provider>
    );
};

export const useComparison = () => {
    const context = useContext(ComparisonContext);
    if (context === undefined) {
        throw new Error('useComparison must be used within a ComparisonProvider');
    }
    return context;
};
