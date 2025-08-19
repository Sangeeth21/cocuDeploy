
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, CommissionRule } from '@/lib/types';
import { doc, onSnapshot, getDoc, collection } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const DEFAULT_AVATAR = 'https://placehold.co/40x40.png';

// Define the shape of the user context state
interface UserState {
    isLoggedIn: boolean;
    user: User | null;
    avatar: string;
    commissionRates: { [key: string]: { [key: string]: CommissionRule } } | null;
    isLoading: boolean;
}

// Define the actions that can be performed
interface UserContextType extends UserState {
    login: () => void;
    logout: () => void;
    updateAvatar: (newAvatar: string) => void;
    setUser: (user: User | null) => void; // Allow setting the user object
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// UserProvider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [commissionRates, setCommissionRates] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setIsLoggedIn(true);
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUser({ id: docSnap.id, ...docSnap.data() } as User);
                    } else {
                        // This case handles the delay between user creation in Auth and Firestore doc creation
                        // We don't set user to null here, we just wait for the doc to be created.
                        console.log("Waiting for user document to be created...");
                    }
                    setIsLoading(false);
                });
                return () => unsubscribeUser();
            } else {
                setIsLoggedIn(false);
                setUser(null);
                setIsLoading(false);
            }
        });

        const commissionRef = doc(db, 'commissions', 'categories');
        const unsubCommissions = onSnapshot(commissionRef, (docSnap) => {
            if (docSnap.exists()) {
                setCommissionRates(docSnap.data() as any);
            }
        });
        
        return () => {
            unsubscribeAuth();
            unsubCommissions();
        }
    }, []);

    const login = () => {
        // This is now handled by onAuthStateChanged, but we keep the function
        // in case we need to trigger manual state updates.
        setIsLoggedIn(true);
    };

    const logout = async () => {
        await signOut(auth);
        setIsLoggedIn(false);
        setUser(null);
    };

    const updateAvatar = (newAvatar: string) => {
        if (user) {
            setUser({ ...user, avatar: newAvatar });
            // The actual DB update happens in the component that calls this
        }
    };
    
    const avatar = user?.avatar || DEFAULT_AVATAR;

    return (
        <UserContext.Provider value={{ isLoggedIn, user, avatar, login, logout, updateAvatar, setUser, commissionRates, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use the user context
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
