
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from '@/lib/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DEFAULT_AVATAR = 'https://placehold.co/40x40.png';

// Define the shape of the user context state
interface UserState {
    isLoggedIn: boolean;
    user: User | null;
    avatar: string;
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
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    // Fetch initial user data
    useEffect(() => {
        if (isLoggedIn) {
            const userId = "USR001"; // This would come from an auth session in a real app
            const unsub = onSnapshot(doc(db, "users", userId), (doc) => {
                if (doc.exists()) {
                    setUser({ id: doc.id, ...doc.data() } as User);
                } else {
                    console.error("User not found in Firestore!");
                    setUser(null);
                }
            });
            return () => unsub();
        } else {
            setUser(null);
        }
    }, [isLoggedIn]);

    const login = () => {
        setIsLoggedIn(true);
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
    };

    const updateAvatar = (newAvatar: string) => {
        if (user) {
            setUser({ ...user, avatar: newAvatar });
            // Here you would also update the avatar in Firestore
        }
    };
    
    const avatar = user?.avatar || DEFAULT_AVATAR;

    return (
        <UserContext.Provider value={{ isLoggedIn, user, avatar, login, logout, updateAvatar, setUser }}>
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
