import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

// Admin-level roles that can access /admin routes
const ADMIN_ROLES = ['super_admin', 'admin'];

// Staff-level roles (all internal platform roles)
const STAFF_ROLES = [
    'super_admin', 'admin', 'content_manager',
    'news_editor', 'seo_manager', 'moderator', 'support'
];

export const UserProvider = ({ children }) => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [user, setUser] = useState(null);
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(true);

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
            setLoading(false);
        };
        fetchUserData();
    }, []);

    // Role helper functions
    const userRole = user?.role || 'guest';
    const isAdmin = ADMIN_ROLES.includes(userRole);
    const isStaff = STAFF_ROLES.includes(userRole);

    const hasRole = (role) => userRole === role;
    const hasAnyRole = (roles) => roles.includes(userRole);

    return (
        <UserContext.Provider value={{
            user, setUser,
            isLogin, setIsLogin,
            loading,
            userRole,
            isAdmin,
            isStaff,
            hasRole,
            hasAnyRole,
        }}>
            {children}
        </UserContext.Provider>
    );
};
