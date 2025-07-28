
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

const DEFAULT_AVATAR = 'https://placehold.co/40x40.png';

// Define the shape of the user context state
interface UserState {
    isLoggedIn: boolean;
    avatar: string;
}

// Define the actions that can be performed
interface UserContextType extends UserState {
    login: () => void;
    logout: () => void;
    updateAvatar: (newAvatar: string) => void;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// UserProvider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [avatar, setAvatar] = useState(DEFAULT_AVATAR);

    const login = () => {
        setIsLoggedIn(true);
        // In a real app, you would fetch user data here
        setAvatar(DEFAULT_AVATAR);
    };

    const logout = () => {
        setIsLoggedIn(false);
        setAvatar(DEFAULT_AVATAR); // Reset avatar on logout
    };

    const updateAvatar = (newAvatar: string) => {
        setAvatar(newAvatar);
    };

    return (
        <UserContext.Provider value={{ isLoggedIn, avatar, login, logout, updateAvatar }}>
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
