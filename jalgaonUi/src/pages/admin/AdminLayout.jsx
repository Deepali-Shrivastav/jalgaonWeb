import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';
import './admin.css';

const AdminLayout = () => {
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        setSidebarCollapsed(!isSidebarCollapsed);
    };

    // Simple breadcrumb logic based on path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('users')) return 'User Management';
        if (path.includes('listings')) return 'Listing Management';
        if (path.includes('news/categories')) return 'News Categories Management';
        if (path.includes('news/comments')) return 'News Comment Moderation';
        if (path.includes('news/create') || path.includes('news/edit')) return 'Edit News Article';
        if (path.includes('news')) return 'News Management';
        if (path.includes('categories')) return 'Category Management';
        if (path.includes('moderation')) return 'Moderation Queue';
        return 'Dashboard Overview';
    };

    return (
        <div className="admin-layout-container">
            <AdminSidebar isCollapsed={isSidebarCollapsed} />
            <div className="admin-main-content">
                <AdminTopbar toggleSidebar={toggleSidebar} title={getPageTitle()} />
                <div className="admin-page-container">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
