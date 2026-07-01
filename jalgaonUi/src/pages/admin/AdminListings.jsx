import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdCheck, MdClose, MdDelete, MdSearch } from 'react-icons/md';

const AdminListings = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [statusMsg, setStatusMsg] = useState('');

    const fetchListings = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(
                `${djangoApi}/api/v1/admin-panel/listings/?search=${searchTerm}&status=${statusFilter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setListings(response.data.results || response.data);
        } catch (error) {
            console.error("Failed to fetch listings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchListings();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter]);

    const handleAction = async (id, action) => {
        if (action === 'delete' && !window.confirm("Are you sure you want to delete this listing?")) return;
        
        const token = localStorage.getItem('token');
        try {
            if (action === 'delete') {
                await axios.delete(`${djangoApi}/api/v1/admin-panel/listings/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStatusMsg("Listing deleted successfully");
            } else {
                const response = await axios.patch(
                    `${djangoApi}/api/v1/admin-panel/listings/${id}/`,
                    { action: action },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setStatusMsg(response.data.message);
            }
            fetchListings();
            setTimeout(() => setStatusMsg(''), 3000);
        } catch (error) {
            setStatusMsg(error.response?.data?.error || `Error processing ${action}`);
            setTimeout(() => setStatusMsg(''), 3000);
        }
    };

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
                            placeholder="Search business name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '35px', width: '250px' }}
                        />
                    </div>
                    <div className="admin-table-filter">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                        </select>
                    </div>
                </div>
                
                <div className="admin-table-wrapper">
                    {loading ? (
                        <div className="admin-loader">Loading listings...</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Business Name</th>
                                    <th>Category</th>
                                    <th>Owner</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.length > 0 ? listings.map((l) => (
                                    <tr key={l.id}>
                                        <td>
                                            <strong>{l.business_name}</strong><br/>
                                            <span style={{fontSize: '0.8rem', color: '#64748b'}}>{l.business_address}</span>
                                        </td>
                                        <td>{l.category_name}</td>
                                        <td>
                                            {l.owner_name}<br/>
                                            <span style={{fontSize: '0.8rem', color: '#64748b'}}>{l.owner_phone}</span>
                                        </td>
                                        <td>
                                            <span className={`admin-badge ${l.is_valid ? 'approved' : 'pending'}`}>
                                                {l.is_valid ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td style={{ display: 'flex', gap: '10px' }}>
                                            {!l.is_valid && (
                                                <button onClick={() => handleAction(l.id, 'approve')} className="admin-action-btn approve" title="Approve">
                                                    <MdCheck />
                                                </button>
                                            )}
                                            {l.is_valid && (
                                                <button onClick={() => handleAction(l.id, 'reject')} className="admin-action-btn reject" title="Reject">
                                                    <MdClose />
                                                </button>
                                            )}
                                            <button onClick={() => handleAction(l.id, 'delete')} className="admin-action-btn delete" title="Delete">
                                                <MdDelete />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center' }}>No listings found.</td>
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

export default AdminListings;
