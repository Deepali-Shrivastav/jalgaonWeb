import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatsCard from '../../components/admin/StatsCard';
import { MdPeople, MdStorefront, MdCategory, MdGavel, MdCheckCircle, MdPending } from 'react-icons/md';

const AdminDashboard = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, [djangoApi]);

    if (loading) return <div className="admin-loader">Loading Dashboard...</div>;
    if (!stats) return <div>Error loading stats</div>;

    return (
        <div>
            <div className="admin-stats-grid">
                <StatsCard title="Total Users" value={stats.total_users} icon={<MdPeople />} />
                <StatsCard title="Total Listings" value={stats.total_listings} icon={<MdStorefront />} />
                <StatsCard title="Approved Listings" value={stats.approved_listings} icon={<MdCheckCircle />} />
                <StatsCard title="Pending Listings" value={stats.pending_listings} icon={<MdPending />} />
                <StatsCard title="Categories" value={stats.total_categories} icon={<MdCategory />} />
                <StatsCard title="Pending Moderation" value={stats.pending_moderation} icon={<MdGavel />} />
            </div>
            
            <div className="admin-table-container" style={{ padding: '20px' }}>
                <h3>Welcome to Jalgaon.com Admin Panel</h3>
                <p style={{ color: '#64748b' }}>
                    Use the sidebar navigation to manage users, business listings, 
                    categories, and the global moderation queue.
                </p>
            </div>
        </div>
    );
};

export default AdminDashboard;
