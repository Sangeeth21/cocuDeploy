
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { DraftProduct } from '@/lib/types';

const VENDOR_VERIFICATION_STORAGE_KEY = 'shopsphere_vendor_verification_progress';

type VendorType = 'personalized' | 'corporate' | 'both';

type VerificationProgress = {
    isVerified: boolean;
    currentStep: number;
    completedSteps: string[];
    draftProducts: DraftProduct[];
    promptState: 'initial' | 'prompting' | 'dismissed' | 'permanently_dismissed' | 'show_draft_publish';
    vendorType?: VendorType;
}

// Define the actions that can be performed
interface VerificationContextType extends VerificationProgress {
    setAsVerified: () => void;
    setAsUnverified: () => void;
    addDraftProduct: (product: DraftProduct) => void;
    removeDrafts: (idsToRemove: string[]) => void;
    setPromptState: (state: VerificationProgress['promptState']) => void;
    setCurrentStep: (step: number) => void;
    setCompletedSteps: (steps: string[]) => void;
    setVendorType: (type: VendorType) => void;
}

// Create the context
const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

const defaultState: VerificationProgress = {
    isVerified: false,
    currentStep: 0,
    completedSteps: [],
    draftProducts: [],
    promptState: 'initial',
};

// --- Provider Component ---
export const VerificationProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<VerificationProgress>(defaultState);
     
    // Load state from localStorage on initial render
    useEffect(() => {
        try {
            const storedProgress = localStorage.getItem(VENDOR_VERIFICATION_STORAGE_KEY);
            if (storedProgress) {
                const parsedProgress = JSON.parse(storedProgress);
                // Basic validation of stored data
                if (typeof parsedProgress.isVerified === 'boolean') {
                    setState(parsedProgress);
                }
            }
        } catch (error) {
            console.error("Failed to parse verification progress from localStorage", error);
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(VENDOR_VERIFICATION_STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error("Failed to save verification progress to localStorage", error);
        }
    }, [state]);

    const setAsVerified = useCallback(() => {
        setState(prev => ({
            ...prev,
            isVerified: true,
            promptState: prev.draftProducts.length > 0 ? 'show_draft_publish' : 'dismissed'
        }));
    }, []);

    const setAsUnverified = useCallback(() => {
        // This would typically be a server-driven action
        // For the mock, we simulate it
        setState(prev => ({ ...prev, isVerified: false, promptState: 'initial' }));
    }, []);

    const addDraftProduct = useCallback((product: DraftProduct) => {
        setState(prev => ({ ...prev, draftProducts: [...prev.draftProducts, product] }));
    }, []);
    
    const removeDrafts = useCallback((idsToRemove: string[]) => {
        setState(prev => ({
            ...prev,
            draftProducts: prev.draftProducts.filter(draft => !idsToRemove.includes(draft.id))
        }));
    }, []);

    const setPromptState = useCallback((newState: VerificationProgress['promptState']) => {
        setState(prev => ({ ...prev, promptState: newState }));
    }, []);

     const setCurrentStep = useCallback((step: number) => {
        setState(prev => ({ ...prev, currentStep: step }));
    }, []);

    const setCompletedSteps = useCallback((steps: string[]) => {
        setState(prev => ({ ...prev, completedSteps: steps }));
    }, []);

    const setVendorType = useCallback((type: VendorType) => {
        setState(prev => ({ ...prev, vendorType: type }));
    }, []);

    const contextValue = {
        ...state,
        setAsVerified,
        setAsUnverified,
        addDraftProduct,
        removeDrafts,
        setPromptState,
        setCurrentStep,
        setCompletedSteps,
        setVendorType,
    };

    return (
        <VerificationContext.Provider value={contextValue}>
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
