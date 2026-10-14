import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [customer, setCustomer] = useState(() => {
        try {
            const saved = localStorage.getItem('tokoku_customer');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Failed to parse customer from localStorage', e);
            return null;
        }
    });

    const loginCustomer = (userData) => {
        setCustomer(userData);
        try {
            localStorage.setItem('tokoku_customer', JSON.stringify(userData));
        } catch (e) {
            console.error('Failed to save customer to localStorage', e);
        }
    };

    const logoutCustomer = () => {
        setCustomer(null);
        try {
            localStorage.removeItem('tokoku_customer');
        } catch (e) {
            console.error('Failed to remove customer from localStorage', e);
        }
    };

    return (
        <AuthContext.Provider value={{ customer, loginCustomer, logoutCustomer, isLoggedIn: !!customer }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
