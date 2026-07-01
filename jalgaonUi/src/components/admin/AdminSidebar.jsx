import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { 
    MdDashboard, MdPeople, MdStorefront, 
    MdCategory, MdGavel, MdArticle, MdComment,
    MdWork, MdAssignment, MdExpandMore, MdExpandLess
} from 'react-icons/md';

const AdminSidebar = ({ isCollapsed }) => {
    const { isAdmin, userRole } = useContext(UserContext);
    
    const [isNewsExpanded, setIsNewsExpanded] = useState(false);
    const [isJobsExpanded, setIsJobsExpanded] = useState(false);

    // Visibility logic based on RBAC matrix
    const canSeeUsers = isAdmin;
    const canSeeListings = isAdmin || ['content_manager', 'moderator'].includes(userRole);
    const canSeeCategories = isAdmin || userRole === 'content_manager';
    const canSeeModeration = isAdmin || userRole === 'moderator' || userRole === 'content_manager';
    const canSeeNews = isAdmin || ['content_manager', 'news_editor'].includes(userRole);
    const canSeeNewsComments = isAdmin || ['content_manager', 'moderator', 'news_editor'].includes(userRole);
    const canSeeJobs = isAdmin || ['content_manager', 'moderator'].includes(userRole);

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
                    <div className="admin-sidebar-dropdown">
                        <div 
                            className="admin-sidebar-dropdown-header"
                            onClick={() => setIsNewsExpanded(!isNewsExpanded)}
                        >
                            <div className="admin-sidebar-dropdown-header-left">
                                <MdArticle className="admin-sidebar-icon" />
                                <span className="admin-sidebar-label">News Module</span>
                            </div>
                            <span className="dropdown-icon">
                                {isNewsExpanded ? <MdExpandLess /> : <MdExpandMore />}
                            </span>
                        </div>
                        {isNewsExpanded && (
                            <div className="admin-sidebar-dropdown-content">
                                <NavLink to="/admin/news" end className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                                    <span className="admin-sidebar-label">Articles</span>
                                </NavLink>
                                
                                <NavLink to="/admin/news/categories" className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                                    <span className="admin-sidebar-label">Categories</span>
                                </NavLink>
                                
                                {canSeeNewsComments && (
                                    <NavLink to="/admin/news/comments" className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                                        <span className="admin-sidebar-label">Comments</span>
                                    </NavLink>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {canSeeJobs && (
                    <div className="admin-sidebar-dropdown">
                        <div 
                            className="admin-sidebar-dropdown-header"
                            onClick={() => setIsJobsExpanded(!isJobsExpanded)}
                        >
                            <div className="admin-sidebar-dropdown-header-left">
                                <MdWork className="admin-sidebar-icon" />
                                <span className="admin-sidebar-label">Job Portal</span>
                            </div>
                            <span className="dropdown-icon">
                                {isJobsExpanded ? <MdExpandLess /> : <MdExpandMore />}
                            </span>
                        </div>
                        {isJobsExpanded && (
                            <div className="admin-sidebar-dropdown-content">
                                <NavLink to="/admin/jobs" end className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                                    <span className="admin-sidebar-label">Job Listings</span>
                                </NavLink>
                                
                                <NavLink to="/admin/jobs/applications" className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                                    <span className="admin-sidebar-label">Applications</span>
                                </NavLink>
                                
                                <NavLink to="/admin/jobs/categories" className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                                    <span className="admin-sidebar-label">Categories</span>
                                </NavLink>
                            </div>
                        )}
                    </div>
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
