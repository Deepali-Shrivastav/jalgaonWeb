import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdCheck, MdClose } from 'react-icons/md';

const AdminClaims = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [statusMsg, setStatusMsg] = useState('');

    const fetchClaims = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(
                `${djangoApi}/api/v1/admin-panel/business-claims/?status=${statusFilter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClaims(response.data.results || response.data);
        } catch (error) {
            console.error("Failed to fetch claims", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, [statusFilter]);

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this claim?`)) return;
        
        const token = localStorage.getItem('token');
        try {
            const response = await axios.patch(
                `${djangoApi}/api/v1/admin-panel/business-claims/${id}/`,
                { action: action },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatusMsg(response.data.message || `Claim ${action}ed successfully.`);
            fetchClaims();
            setTimeout(() => setStatusMsg(''), 4000);
        } catch (error) {
            setStatusMsg(error.response?.data?.error || `Error processing ${action}`);
            setTimeout(() => setStatusMsg(''), 4000);
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
                    <h3 style={{ margin: 0 }}>Business Claims</h3>
                    <div className="admin-table-filter">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
                
                <div className="admin-table-wrapper">
                    {loading ? (
                        <div className="admin-loader">Loading claims...</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Business</th>
                                    <th>Claimed By</th>
                                    <th>Message / Info</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {claims.length > 0 ? claims.map((claim) => (
                                    <tr key={claim.id}>
                                        <td><strong>{claim.business_name}</strong></td>
                                        <td>
                                            {claim.user_name || 'User'} <br/>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{claim.contact_number || claim.user_phone}</span>
                                        </td>
                                        <td><div style={{maxWidth: '250px', whiteSpace: 'pre-wrap', fontSize: '0.9rem'}}>{claim.message}</div></td>
                                        <td>{new Date(claim.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`admin-badge ${claim.status}`}>
                                                {claim.status}
                                            </span>
                                        </td>
                                        <td style={{ display: 'flex', gap: '10px' }}>
                                            {claim.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleAction(claim.id, 'approve')} className="admin-action-btn approve" title="Approve">
                                                        <MdCheck /> Approve
                                                    </button>
                                                    <button onClick={() => handleAction(claim.id, 'reject')} className="admin-action-btn reject" title="Reject">
                                                        <MdClose /> Reject
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center' }}>No claims found.</td>
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

export default AdminClaims;
