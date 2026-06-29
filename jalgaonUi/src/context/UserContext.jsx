import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [user, setUser] = useState(null);
    const [isLogin, setIsLogin] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get(`${djangoApi}/api/v1/auth/user/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(response.data.user);
                    setIsLogin(true);
                } catch (error) {
                    console.error('Error fetching protected data:', error);
                    setIsLogin(false);
                }
            }
        };
        fetchUserData();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, isLogin, setIsLogin }}>
            {children}
        </UserContext.Provider>
    );
};
