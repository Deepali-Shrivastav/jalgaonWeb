import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import StatsCard from '../../components/admin/StatsCard';
import { MdPeople, MdStorefront, MdCategory, MdGavel, MdCheckCircle, MdPending, MdArticle, MdComment } from 'react-icons/md';
import { UserContext } from '../../context/UserContext';

const AdminDashboard = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const { isAdmin, userRole } = useContext(UserContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(isAdmin);

    useEffect(() => {
        if (!isAdmin) return;

        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`${djangoApi}/api/v1/admin-panel/stats/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [djangoApi, isAdmin]);

    if (loading) return <div className="admin-loader">Loading Dashboard...</div>;
    if (isAdmin && !stats) return <div>Error loading stats</div>;

    return (
        <div>
            {isAdmin && stats && (
                <div className="admin-stats-grid">
                    <StatsCard title="Total Users" value={stats.total_users} icon={<MdPeople />} />
                    <StatsCard title="Total Listings" value={stats.total_listings} icon={<MdStorefront />} />
                    <StatsCard title="Approved Listings" value={stats.approved_listings} icon={<MdCheckCircle />} />
                    <StatsCard title="Pending Listings" value={stats.pending_listings} icon={<MdPending />} />
                    <StatsCard title="Categories" value={stats.total_categories} icon={<MdCategory />} />
                    <StatsCard title="Pending Moderation" value={stats.pending_moderation} icon={<MdGavel />} />
                </div>
            )}
            
            {isAdmin && (
                <div className="admin-table-container" style={{ padding: '20px' }}>
                    <h3>Welcome to Jalgaon.com Admin Panel</h3>
                    <p style={{ color: '#64748b' }}>
                        Use the sidebar navigation to manage users, business listings, 
                        categories, and the global moderation queue.
                    </p>
                </div>
            )}

            {!isAdmin && userRole === 'news_editor' && (
                <div className="admin-table-container" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Welcome to the News Editor Dashboard</h2>
                    <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '1.05rem' }}>
                        From here you can manage all news articles, organize categories, and moderate reader comments.
                    </p>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button 
                            onClick={() => window.location.href = '/admin/news/create'} 
                            className="admin-btn primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '1rem' }}
                        >
                            <MdArticle /> Write New Article
                        </button>
                        <button 
                            onClick={() => window.location.href = '/admin/news/comments'} 
                            className="admin-btn"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '1rem', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}
                        >
                            <MdComment /> Review Comments
                        </button>
                    </div>
                </div>
            )}

            {!isAdmin && userRole !== 'news_editor' && (
                <div className="admin-table-container" style={{ padding: '20px' }}>
                    <h3>Welcome to Jalgaon.com Staff Panel</h3>
                    <p style={{ color: '#64748b' }}>
                        Use the sidebar navigation to access your authorized management tools.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
