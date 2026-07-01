import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { 
    MdDashboard, MdPeople, MdStorefront, 
    MdCategory, MdGavel, MdArticle, MdComment
} from 'react-icons/md';

const AdminSidebar = ({ isCollapsed }) => {
    const { isAdmin, userRole } = useContext(UserContext);

    // Visibility logic based on RBAC matrix
    const canSeeUsers = isAdmin;
    const canSeeListings = isAdmin || ['content_manager', 'moderator'].includes(userRole);
    const canSeeCategories = isAdmin || userRole === 'content_manager';
    const canSeeModeration = isAdmin || userRole === 'moderator' || userRole === 'content_manager';
    const canSeeNews = isAdmin || ['content_manager', 'news_editor'].includes(userRole);
    const canSeeNewsComments = isAdmin || ['content_manager', 'moderator', 'news_editor'].includes(userRole);

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
                
                {canSeeNews && (
                    <>
                        <NavLink to="/admin/news" end className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                            <MdArticle className="admin-sidebar-icon" />
                            <span className="admin-sidebar-label">News Articles</span>
                        </NavLink>
                        
                        <NavLink to="/admin/news/categories" className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                            <MdCategory className="admin-sidebar-icon" />
                            <span className="admin-sidebar-label">News Categories</span>
                        </NavLink>
                    </>
                )}
                
                {canSeeNewsComments && (
                    <NavLink to="/admin/news/comments" className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                        <MdComment className="admin-sidebar-icon" />
                        <span className="admin-sidebar-label">News Comments</span>
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
