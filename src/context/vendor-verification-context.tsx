
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { DraftProduct } from '@/lib/types';


// Define the shape of the verification context state
interface VerificationState {
    isVerified: boolean;
    draftProducts: DraftProduct[];
    promptState: 'initial' | 'prompting' | 'dismissed' | 'permanently_dismissed' | 'show_draft_publish';
}

// Define the actions that can be performed
interface VerificationContextType extends VerificationState {
    setAsVerified: () => void;
    setAsUnverified: () => void;
    addDraftProduct: (product: DraftProduct) => void;
    removeDrafts: (idsToRemove: string[]) => void;
    setPromptState: (state: VerificationState['promptState']) => void;
}

// Create the context
const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

// --- Provider Component ---
export const VerificationProvider = ({ children }: { children: ReactNode }) => {
    const [isVerified, setIsVerified] = useState(false);
    const [draftProducts, setDraftProducts] = useState<DraftProduct[]>([]);
    const [promptState, setPromptState] = useState<VerificationState['promptState']>('initial');

    const setAsVerified = useCallback(() => {
        setIsVerified(true);
        // If there are drafts when the user becomes verified, change prompt state
        if (draftProducts.length > 0) {
            setPromptState('show_draft_publish');
        }
    }, [draftProducts.length]);

    const setAsUnverified = useCallback(() => {
        setIsVerified(false);
        setPromptState('initial');
    }, []);

    const addDraftProduct = useCallback((product: DraftProduct) => {
        setDraftProducts(prev => [...prev, product]);
    }, []);
    
    const removeDrafts = useCallback((idsToRemove: string[]) => {
        setDraftProducts(prev => prev.filter(draft => !idsToRemove.includes(draft.id)));
    }, []);


    return (
        <VerificationContext.Provider value={{ 
            isVerified, 
            draftProducts,
            promptState,
            setAsVerified, 
            setAsUnverified,
            addDraftProduct,
            removeDrafts,
            setPromptState,
        }}>
            {children}
        </VerificationContext.Provider>
    );
};

// --- Custom Hook ---
export const useVerification = () => {
    const context = useContext(VerificationContext);
    if (context === undefined) {
        throw new Error('useVerification must be used within a VerificationProvider');
    }
    return context;
};
