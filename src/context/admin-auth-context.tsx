
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

const ADMIN_AUTH_KEY = 'shopsphere_admin_auth_status';

interface AdminAuthState {
    isAdminLoggedIn: boolean;
    isLoading: boolean;
}

interface AdminAuthContextType extends AdminAuthState {
    adminLogin: () => void;
    adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AdminAuthState>({ isAdminLoggedIn: false, isLoading: true });

    useEffect(() => {
        try {
            const storedAuth = localStorage.getItem(ADMIN_AUTH_KEY);
            if (storedAuth) {
                const parsedAuth = JSON.parse(storedAuth);
                if (parsedAuth.isAdminLoggedIn === true) {
                    setState({ isAdminLoggedIn: true, isLoading: false });
                } else {
                    setState({ isAdminLoggedIn: false, isLoading: false });
                }
            } else {
                setState({ isAdminLoggedIn: false, isLoading: false });
            }
        } catch (error) {
            console.error("Failed to parse admin auth status from localStorage", error);
            setState({ isAdminLoggedIn: false, isLoading: false });
        }
    }, []);

    const adminLogin = useCallback(() => {
        const newState = { isAdminLoggedIn: true, isLoading: false };
        setState(newState);
        try {
            localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify({ isAdminLoggedIn: true }));
        } catch (error) {
            console.error("Failed to save admin auth status to localStorage", error);
        }
    }, []);

    const adminLogout = useCallback(() => {
        const newState = { isAdminLoggedIn: false, isLoading: false };
        setState(newState);
        try {
            localStorage.removeItem(ADMIN_AUTH_KEY);
        } catch (error) {
            console.error("Failed to remove admin auth status from localStorage", error);
        }
    }, []);


    return (
        <AdminAuthContext.Provider value={{ ...state, adminLogin, adminLogout }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};
