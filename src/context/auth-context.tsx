'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'manager' | 'team-leader' | 'co-operator';
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: any) => void;
    register: (userData: any) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verify token and get user data
                    // For now, we'll just assume if token exists, we are logged in
                    // Ideally, you'd have a /me endpoint to validate
                    const { data } = await api.get('/auth/me');
                    setUser({ ...data, token });
                } catch (error) {
                    console.error('Auth check failed', error);
                    localStorage.removeItem('token');
                }
            }
            setIsLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = async (userData: any) => {
        const { data } = await api.post('/auth/login', userData);
        localStorage.setItem('token', data.token);
        setUser(data);
        router.push('/');
    };

    const register = async (userData: any) => {
        const { data } = await api.post('/auth/register', userData);
        localStorage.setItem('token', data.token);
        setUser(data);
        router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
