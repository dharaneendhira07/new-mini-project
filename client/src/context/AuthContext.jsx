import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser); // set initial immediately from storage
                    
                    if (parsedUser.token) {
                        try {
                            const { data } = await authAPI.getMe();
                            const freshUser = { ...parsedUser, ...data };
                            setUser(freshUser);
                            localStorage.setItem('user', JSON.stringify(freshUser));
                        } catch (apiErr) {
                            console.error('Failed to fetch fresh user details', apiErr);
                        }
                    }
                } catch {
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const { data } = await authAPI.login(email, password);
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
    };

    const register = async (name, email, password, role) => {
        const { data } = await authAPI.register({ name, email, password, role });
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const loginWithGoogle = async (tokenId, role) => {
        const { data } = await authAPI.googleLogin(tokenId, role);
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
    };

    const updateUser = (newData) => {
        const updated = { ...user, ...newData };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, loginWithGoogle }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
