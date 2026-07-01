import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { 
    MdDashboard, MdPeople, MdStorefront, 
    MdCategory, MdGavel 
} from 'react-icons/md';

const AdminSidebar = ({ isCollapsed }) => {
    const { isAdmin, userRole } = useContext(UserContext);

    // Visibility logic based on RBAC matrix
    const canSeeUsers = isAdmin;
    const canSeeListings = isAdmin || ['content_manager', 'moderator'].includes(userRole);
    const canSeeCategories = isAdmin || userRole === 'content_manager';
    const canSeeModeration = isAdmin || userRole === 'moderator' || userRole === 'content_manager';

    return (
        <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="admin-sidebar-header">
                <h2>{isCollapsed ? 'J' : 'Jalgaon Admin'}</h2>
            </div>
            
            <nav className="admin-sidebar-nav">
                <NavLink to="/admin" end className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                    <MdDashboard className="admin-sidebar-icon" />
                    <span className="admin-sidebar-label">Dashboard</span>
                </NavLink>

                {canSeeUsers && (
                    <NavLink to="/admin/users" className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                        <MdPeople className="admin-sidebar-icon" />
                        <span className="admin-sidebar-label">Users</span>
                    </NavLink>
                )}

                {canSeeListings && (
                    <NavLink to="/admin/listings" className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                        <MdStorefront className="admin-sidebar-icon" />
                        <span className="admin-sidebar-label">Listings</span>
                    </NavLink>
                )}

                {canSeeCategories && (
                    <NavLink to="/admin/categories" className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                        <MdCategory className="admin-sidebar-icon" />
                        <span className="admin-sidebar-label">Categories</span>
                    </NavLink>
                )}

                {canSeeModeration && (
                    <NavLink to="/admin/moderation" className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                        <MdGavel className="admin-sidebar-icon" />
                        <span className="admin-sidebar-label">Moderation</span>
                    </NavLink>
                )}
            </nav>
        </aside>
    );
};

export default AdminSidebar;
