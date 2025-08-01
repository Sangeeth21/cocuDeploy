
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

const ADMIN_AUTH_KEY = 'shopsphere_admin_auth_status';

interface AdminAuthState {
    isAdminLoggedIn: boolean;
}

interface AdminAuthContextType extends AdminAuthState {
    adminLogin: () => void;
    adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AdminAuthState>({ isAdminLoggedIn: false });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedAuth = localStorage.getItem(ADMIN_AUTH_KEY);
            if (storedAuth) {
                const parsedAuth = JSON.parse(storedAuth);
                if (parsedAuth.isAdminLoggedIn === true) {
                    setState({ isAdminLoggedIn: true });
                }
            }
        } catch (error) {
            console.error("Failed to parse admin auth status from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const adminLogin = useCallback(() => {
        const newState = { isAdminLoggedIn: true };
        setState(newState);
        try {
            localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(newState));
        } catch (error) {
            console.error("Failed to save admin auth status to localStorage", error);
        }
    }, []);

    const adminLogout = useCallback(() => {
        const newState = { isAdminLoggedIn: false };
        setState(newState);
        try {
            localStorage.removeItem(ADMIN_AUTH_KEY);
        } catch (error) {
            console.error("Failed to remove admin auth status from localStorage", error);
        }
    }, []);

    if (isLoading) {
        return null; // Or a loading spinner
    }

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
