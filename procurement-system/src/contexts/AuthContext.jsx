/* eslint-disable react/prop-types */
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../utils/endpoint';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${baseURL}/auth/login`, { email, password });
            const { user, token } = response.data;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            setUser(user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (username, email, password, role) => {
        try {
            const response = await axios.post(`${baseURL}/auth/register`, { username, email, password, role });
            const { user, token } = response.data;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            setUser(user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};