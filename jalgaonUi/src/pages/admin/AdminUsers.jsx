import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { MdEdit, MdSearch } from 'react-icons/md';

const AdminUsers = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const { userRole } = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusMsg, setStatusMsg] = useState('');

    const isSuperAdmin = userRole === 'super_admin';

    const fetchUsers = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${djangoApi}/api/v1/admin-panel/users/?search=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.results || response.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleRoleChange = async (userId, newRole) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.patch(
                `${djangoApi}/api/v1/admin-panel/users/${userId}/role/`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatusMsg(response.data.message);
            fetchUsers();
            setTimeout(() => setStatusMsg(''), 3000);
        } catch (error) {
            setStatusMsg(error.response?.data?.error || "Error updating role");
            setTimeout(() => setStatusMsg(''), 3000);
        }
    };

    const roles = [
        'super_admin', 'admin', 'content_manager', 'news_editor', 
        'seo_manager', 'moderator', 'support', 'advertiser', 
        'business_owner', 'registered_user', 'guest'
    ];

    return (
        <div>
            {statusMsg && (
                <div style={{ padding: '10px', background: '#dcfce7', color: '#166534', marginBottom: '15px', borderRadius: '4px' }}>
                    {statusMsg}
                </div>
            )}
            
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <div className="admin-table-search" style={{ position: 'relative' }}>
                        <MdSearch style={{ position: 'absolute', top: '10px', left: '10px', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search by name or phone..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '35px', width: '300px' }}
                        />
                    </div>
                </div>
                
                <div className="admin-table-wrapper">
                    {loading ? (
                        <div className="admin-loader">Loading users...</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Phone / ID</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Joined Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? users.map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.phone_number}</td>
                                        <td>{u.first_name ? `${u.first_name} ${u.last_name || ''}` : '-'}</td>
                                        <td>
                                            {isSuperAdmin ? (
                                                <select 
                                                    value={u.role} 
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                                >
                                                    {roles.map(r => (
                                                        <option key={r} value={r}>{r.replace('_', ' ')}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={`admin-badge ${['super_admin', 'admin'].includes(u.role) ? 'info' : ''}`}>
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                            )}
                                        </td>
                                        <td>{new Date(u.date_joined).toLocaleDateString()}</td>
                                        <td>
                                            <button className="admin-action-btn edit" title="Edit User">
                                                <MdEdit />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center' }}>No users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
