

"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthDialogState = {
    isOpen: boolean;
    initialTab: 'login' | 'signup';
};

type AuthDialogContextType = {
    authDialogState: AuthDialogState;
    openDialog: (tab?: 'login' | 'signup') => void;
    closeDialog: () => void;
};

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(undefined);

export const AuthDialogProvider = ({ children }: { children: ReactNode }) => {
    const [authDialogState, setAuthDialogState] = useState<AuthDialogState>({
        isOpen: false,
        initialTab: 'login',
    });

    const openDialog = (tab: 'login' | 'signup' = 'login') => {
        setAuthDialogState({ isOpen: true, initialTab: tab });
    };

    const closeDialog = () => {
        setAuthDialogState({ ...authDialogState, isOpen: false });
    };

    return (
        <AuthDialogContext.Provider value={{ authDialogState, openDialog, closeDialog }}>
            {children}
        </AuthDialogContext.Provider>
    );
};

export const useAuthDialog = () => {
    const context = useContext(AuthDialogContext);
    if (context === undefined) {
        throw new Error('useAuthDialog must be used within an AuthDialogProvider');
    }
    return context;
};
