
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type CorporateAuthDialogState = {
    isOpen: boolean;
};

type CorporateAuthDialogContextType = {
    isOpen: boolean;
    openDialog: () => void;
    closeDialog: () => void;
};

const CorporateAuthDialogContext = createContext<CorporateAuthDialogContextType | undefined>(undefined);

export const CorporateAuthDialogProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openDialog = () => {
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
    };

    return (
        <CorporateAuthDialogContext.Provider value={{ isOpen, openDialog, closeDialog }}>
            {children}
        </CorporateAuthDialogContext.Provider>
    );
};

export const useCorporateAuthDialog = () => {
    const context = useContext(CorporateAuthDialogContext);
    if (context === undefined) {
        throw new Error('useCorporateAuthDialog must be used within a CorporateAuthDialogProvider');
    }
    return context;
};
