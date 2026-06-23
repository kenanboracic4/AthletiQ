'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api, setAccessToken } from '../api/api';
import { loginUser as loginApi, logoutUser as logoutApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const isLoggingOut = useRef(false);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        if (isLoggingOut.current) {
            setIsLoading(false);
            return;
        }

        const init = async () => {
            try {
                const response = await api.get('/auth/me/session');
                setAccessToken(response.data.access_token);
                setUser(response.data.user);
            } catch {
                setUser(null);
                setAccessToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, []);

    const login = async (data) => {
        try {
            const responseData = await loginApi(data);
            if (responseData.access_token) {
                setAccessToken(responseData.access_token);
            }
            setUser(responseData.user);
            return responseData;
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    const logout = async () => {
        isLoggingOut.current = true;
        try {
            await logoutApi();
        } catch (error) {
            console.log(error);
        } finally {
            setAccessToken(null);
            setUser(null);
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    };

    const updateAuthUser = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateAuthUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);