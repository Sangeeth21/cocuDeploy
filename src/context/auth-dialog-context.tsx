
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type DialogTab = 'login' | 'signup';
type DialogState = 'closed' | 'auth' | 'forgot_password';

interface AuthDialogState {
    currentState: DialogState;
    initialTab: DialogTab;
};

type AuthDialogContextType = {
    authDialogState: AuthDialogState;
    openDialog: (tab?: DialogTab) => void;
    openForgotPasswordDialog: () => void;
    closeDialog: () => void;
};

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(undefined);

export const AuthDialogProvider = ({ children }: { children: ReactNode }) => {
    const [authDialogState, setAuthDialogState] = useState<AuthDialogState>({
        currentState: 'closed',
        initialTab: 'login',
    });

    const openDialog = (tab: DialogTab = 'login') => {
        setAuthDialogState({ currentState: 'auth', initialTab: tab });
    };

    const openForgotPasswordDialog = () => {
        setAuthDialogState({ currentState: 'forgot_password', initialTab: 'login' });
    };

    const closeDialog = () => {
        setAuthDialogState({ ...authDialogState, currentState: 'closed' });
    };

    return (
        <AuthDialogContext.Provider value={{ authDialogState, openDialog, openForgotPasswordDialog, closeDialog }}>
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
