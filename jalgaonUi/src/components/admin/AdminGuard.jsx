import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const AdminGuard = ({ children, requiredRole = null }) => {
    const { isStaff, loading, userRole, hasRole } = useContext(UserContext);

    if (loading) {
        return <div className="admin-loader">Loading...</div>;
    }

    // Must be at least staff to access any admin route
    if (!isStaff) {
        return <Navigate to="/" replace />;
    }

    // If a specific role is required (e.g., 'super_admin' for User roles)
    if (requiredRole && !hasRole(requiredRole) && userRole !== 'super_admin' && userRole !== 'admin') {
         return <Navigate to="/admin" replace />;
    }

    return children;
};

export default AdminGuard;
