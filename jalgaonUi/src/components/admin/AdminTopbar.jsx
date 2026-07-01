import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { MdMenu, MdExitToApp, MdOutlineOpenInNew } from 'react-icons/md';
import axios from 'axios';

const AdminTopbar = ({ toggleSidebar, title = 'Dashboard' }) => {
    const { user, userRole, setUser, setIsLogin } = useContext(UserContext);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const djangoApi = import.meta.env.VITE_DJANGO_API;

    const getInitials = () => {
        if (user?.first_name) {
            return user.first_name.charAt(0).toUpperCase();
        }
        if (user?.phone_number) {
            return user.phone_number.charAt(0);
        }
        return 'U';
    };

    const formatRole = (role) => {
        return role ? role.replace('_', ' ') : '';
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post(`${djangoApi}/api/v1/auth/logout/`);
        } catch (err) {
            console.error('Logout error', err);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('tokenKey');
            localStorage.removeItem('user');
            setUser(null);
            setIsLogin(false);
            navigate('/');
        }
    };

    return (
        <header className="admin-topbar">
            <div className="admin-topbar-left">
                <button className="admin-menu-toggle" onClick={toggleSidebar}>
                    <MdMenu />
                </button>
                <h1 className="admin-page-title">{title}</h1>
            </div>
            
            <div className="admin-topbar-right" ref={dropdownRef}>
                <button 
                    className="admin-btn" 
                    onClick={() => navigate('/')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '15px', background: '#f1f5f9', color: '#334155' }}
                >
                    <MdOutlineOpenInNew /> Back to Website
                </button>
                <div 

                    className="admin-user-profile" 
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                >
                    <div className="admin-user-avatar">
                        {getInitials()}
                    </div>
                    <div className="admin-user-info">
                        <p>{user?.first_name || user?.phone_number}</p>
                        <span>{formatRole(userRole)}</span>
                    </div>

                    {isDropdownOpen && (
                        <div className="admin-profile-dropdown">
                            <div className="dropdown-header">
                                <strong>{user?.phone_number}</strong>
                            </div>
                            <div className="dropdown-menu">
                                <button onClick={() => navigate('/')}>
                                    <MdOutlineOpenInNew /> Back to Website
                                </button>
                                <button onClick={handleLogout} className="logout-btn">
                                    <MdExitToApp /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminTopbar;
