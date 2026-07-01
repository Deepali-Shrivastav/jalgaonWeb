import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdCheck, MdClose } from 'react-icons/md';

const AdminModeration = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [statusMsg, setStatusMsg] = useState('');

    const fetchQueue = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(
                `${djangoApi}/api/v1/admin-panel/moderation/?status=${statusFilter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQueue(response.data.results || response.data);
        } catch (error) {
            console.error("Failed to fetch moderation queue", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, [statusFilter]);

    const handleAction = async (id, action) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.patch(
                `${djangoApi}/api/v1/admin-panel/moderation/${id}/`,
                { action: action },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatusMsg(`Item ${action}ed successfully.`);
            fetchQueue();
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
                    <h3 style={{ margin: 0 }}>Global Moderation Queue</h3>
                    <div className="admin-table-filter">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="pending">Pending Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
                
                <div className="admin-table-wrapper">
                    {loading ? (
                        <div className="admin-loader">Loading queue...</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Content Type</th>
                                    <th>Preview</th>
                                    <th>Submitted By</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {queue.length > 0 ? queue.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ textTransform: 'capitalize' }}>{item.content_type_name}</td>
                                        <td>
                                            {item.content_preview?.error ? (
                                                <span style={{ color: 'red' }}>Content missing</span>
                                            ) : (
                                                <>
                                                    <strong>{item.content_preview?.name || 'N/A'}</strong>
                                                    {item.content_preview?.address && <><br/><span style={{ fontSize: '0.8rem', color: '#64748b'}}>{item.content_preview.address}</span></>}
                                                </>
                                            )}
                                        </td>
                                        <td>{item.submitted_by_phone}</td>
                                        <td>{new Date(item.submitted_at).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`admin-badge ${item.status}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{ display: 'flex', gap: '10px' }}>
                                            {item.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleAction(item.id, 'approve')} className="admin-action-btn approve" title="Approve">
                                                        <MdCheck /> Approve
                                                    </button>
                                                    <button onClick={() => handleAction(item.id, 'reject')} className="admin-action-btn reject" title="Reject">
                                                        <MdClose /> Reject
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center' }}>No items in moderation queue.</td>
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

export default AdminModeration;
