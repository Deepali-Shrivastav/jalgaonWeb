import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdCheck, MdClose, MdSearch, MdImage } from 'react-icons/md';

const AdminAds = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [statusMsg, setStatusMsg] = useState('');

    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [targetRejectId, setTargetRejectId] = useState(null);

    const fetchAds = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(
                `${djangoApi}/api/v1/admin-panel/ads/?status=${statusFilter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAds(response.data.results || response.data);
        } catch (error) {
            console.error("Failed to fetch ads", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, [statusFilter]);

    const handleAction = async (id, action, reason = '') => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.patch(
                `${djangoApi}/api/v1/admin-panel/ads/${id}/`,
                { action: action, rejection_reason: reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatusMsg(response.data.message);
            fetchAds();
            setTimeout(() => setStatusMsg(''), 3000);
        } catch (error) {
            setStatusMsg(error.response?.data?.error || `Error processing ${action}`);
            setTimeout(() => setStatusMsg(''), 3000);
        }
    };

    const openRejectModal = (id) => {
        setTargetRejectId(id);
        setRejectionReason('');
        setRejectModalOpen(true);
    };

    const submitReject = () => {
        if (targetRejectId) {
            handleAction(targetRejectId, 'reject', rejectionReason);
        }
        setRejectModalOpen(false);
    };

    const openPreview = (ad) => {
        setPreviewData(ad);
        setPreviewModalOpen(true);
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
                    <h2 style={{ margin: 0 }}>Ads Moderation Queue</h2>
                    <div className="admin-table-filter">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
                
                <div className="admin-table-wrapper">
                    {loading ? (
                        <div className="admin-loader">Loading ads...</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Ad Title</th>
                                    <th>Type</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ads.length > 0 ? ads.map((ad) => (
                                    <tr key={ad.id}>
                                        <td>
                                            <strong>{ad.name}</strong>
                                        </td>
                                        <td>{ad.ad_type === 'BA' ? 'Banner Ad' : 'Carousel Ad'}</td>
                                        <td>
                                            {ad.contact_number}<br/>
                                            <span style={{fontSize: '0.8rem', color: '#64748b'}}>{ad.contact_email}</span>
                                        </td>
                                        <td>
                                            <span className={`admin-badge ${ad.status === 'active' ? 'approved' : ad.status === 'rejected' ? 'rejected' : 'pending'}`}>
                                                {ad.status === 'active' ? 'Active' : ad.status === 'rejected' ? 'Rejected' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>{new Date(ad.created_at).toLocaleDateString()}</td>
                                        <td style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => openPreview(ad)} className="admin-action-btn" style={{ background: '#f1f5f9', color: '#475569' }} title="Preview Image">
                                                <MdImage />
                                            </button>
                                            {ad.status !== 'active' && (
                                                <button onClick={() => handleAction(ad.id, 'approve')} className="admin-action-btn approve" title="Approve">
                                                    <MdCheck />
                                                </button>
                                            )}
                                            {ad.status !== 'rejected' && (
                                                <button onClick={() => openRejectModal(ad.id)} className="admin-action-btn reject" title="Reject">
                                                    <MdClose />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center' }}>No advertisements found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Rejection Modal */}
            {rejectModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Reject Advertisement</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Please provide a reason for rejection.</p>
                        <textarea 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows="4"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', marginBottom: '20px' }}
                            placeholder="e.g. Image violates guidelines, wrong format..."
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setRejectModalOpen(false)} style={{ padding: '8px 15px', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={submitReject} style={{ padding: '8px 15px', border: 'none', background: '#ef4444', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewModalOpen && previewData && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', width: '700px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px' }}>{previewData.name} ({previewData.ad_type === 'BA' ? 'Banner Ad' : 'Carousel Ad'})</h2>
                            <button onClick={() => setPreviewModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}><MdClose /></button>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <img src={previewData.ad_image.startsWith('http') ? previewData.ad_image : `${djangoApi}${previewData.ad_image}`} alt="Ad Preview" style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAds;
