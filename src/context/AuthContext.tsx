import React, { createContext, useContext, useState } from 'react';

interface User {
    id: number;
    username: string;
    company: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    companyName: string | null;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const isLoggedIn = !!user;
    const companyName = user ? user.company : null;

    const login = (userData: User) => {
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('companyName', userData.company);
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('companyName');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, companyName, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
