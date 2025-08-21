// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    userId: number;
    username: string;
    role: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<string>;
    verifyOtp: (tempToken: string, otp: string) => Promise<void>;
    logout: () => void;
    updateUser: (userData: User) => void;
    signup: (username: string, email: string, password: string, role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        console.log('AuthProvider - Initializing user from localStorage');
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        console.log('Token from localStorage:', token);
        console.log('User from localStorage:', savedUser);

        if (token && savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                console.log('Parsed user:', parsedUser);
                if (parsedUser.userId && parsedUser.username && parsedUser.role && parsedUser.email) {
                    setUser(parsedUser);
                    console.log('User set from localStorage:', parsedUser);
                } else {
                    console.log('Invalid user data in localStorage, clearing storage');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Failed to parse user from localStorage:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } else {
            console.log('No valid token or user in localStorage, user remains null');
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            console.log('Sending login request for email:', email);
            const response = await axios.post('http://localhost:8080/auth/login', { email, password });
            if (response.data.status === '2fa_required') {
                console.log('Login response - tempToken:', response.data.tempToken);
                return response.data.tempToken;
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (error: any) {
            console.error('Login failed:', error);
            throw new Error(error.response?.data?.error || 'Login failed');
        }
    };

    const verifyOtp = async (tempToken: string, otp: string) => {
        try {
            console.log('Sending verifyOtp request - tempToken:', tempToken, 'otp:', otp);
            const payload = { tempToken, otp };
            console.log('verifyOtp payload:', JSON.stringify(payload));
            const response = await axios.post('http://localhost:8080/auth/verify-otp', payload);
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({
                userId: userData.id,
                username: userData.username,
                email: userData.email,
                role: userData.role,
            }));
            setUser({
                userId: userData.id,
                username: userData.username,
                email: userData.email,
                role: userData.role,
            });
        } catch (error: any) {
            console.error('OTP verification failed:', error);
            throw new Error(error.response?.data?.error || 'Invalid or expired OTP');
        }
    };

    const logout = () => {
        console.log('Logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (userData: User) => {
        console.log('Updating user:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const signup = async (username: string, email: string, password: string, role: string) => {
        try {
            console.log('Sending signup request for email:', email);
            const response = await axios.post('http://localhost:8080/users', {
                username,
                email,
                password,
                role: role.toUpperCase(),
            });
            const userData: User = {
                userId: response.data.id,
                username: response.data.username,
                email: response.data.email,
                role: response.data.role,
            };
            const token = `mock-token-${response.data.id}`;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error: any) {
            console.error('Signup failed:', error);
            throw new Error(error.response?.data?.error || 'Failed to create account');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, verifyOtp, logout, updateUser, signup }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};