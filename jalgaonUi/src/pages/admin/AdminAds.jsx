import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdCheck, MdClose, MdImage, MdEditNote } from 'react-icons/md';
import AdminAdSlots from './AdminAdSlots';

const AdminAds = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' or 'slots'

    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [statusMsg, setStatusMsg] = useState('');

    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [revisionModalOpen, setRevisionModalOpen] = useState(false);
    const [modalNotes, setModalNotes] = useState('');
    const [targetAdId, setTargetAdId] = useState(null);

    const fetchAds = async () => {
        setLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
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
        if (activeTab === 'moderation') {
            fetchAds();
        }
    }, [statusFilter, activeTab]);

    const handleAction = async (id, action, notes = '') => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        try {
            const response = await axios.patch(
                `${djangoApi}/api/v1/admin-panel/ads/${id}/`,
                { action: action, rejection_reason: notes },
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
        setTargetAdId(id);
        setModalNotes('');
        setRejectModalOpen(true);
    };

    const openRevisionModal = (id) => {
        setTargetAdId(id);
        setModalNotes('');
        setRevisionModalOpen(true);
    };

    const submitReject = () => {
        if (targetAdId) {
            handleAction(targetAdId, 'reject', modalNotes);
        }
        setRejectModalOpen(false);
    };

    const submitRevision = () => {
        if (targetAdId) {
            handleAction(targetAdId, 'request_revision', modalNotes);
        }
        setRevisionModalOpen(false);
    };

    const openPreview = (ad) => {
        setPreviewData(ad);
        setPreviewModalOpen(true);
    };

    return (
        <div>
            {/* Top Navigation Tabs */}
            <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
                <button
                    onClick={() => setActiveTab('moderation')}
                    style={{
                        padding: '12px 24px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'moderation' ? '3px solid #2563eb' : '3px solid transparent',
                        color: activeTab === 'moderation' ? '#2563eb' : '#64748b',
                        fontWeight: '700',
                        fontSize: '15px',
                        cursor: 'pointer'
                    }}
                >
                    Ads Moderation Queue
                </button>
                <button
                    onClick={() => setActiveTab('slots')}
                    style={{
                        padding: '12px 24px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'slots' ? '3px solid #2563eb' : '3px solid transparent',
                        color: activeTab === 'slots' ? '#2563eb' : '#64748b',
                        fontWeight: '700',
                        fontSize: '15px',
                        cursor: 'pointer'
                    }}
                >
                    Global Ad Placement Slots
                </button>
            </div>

            {activeTab === 'slots' ? (
                <AdminAdSlots />
            ) : (
                <>
                    {statusMsg && (
                        <div style={{ padding: '12px 16px', background: '#dcfce7', color: '#166534', marginBottom: '20px', borderRadius: '6px' }}>
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
                                    <option value="revision_requested">Revision Requested</option>
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
                                            <th>Ad Campaign</th>
                                            <th>Placement & Package</th>
                                            <th>Contact Info</th>
                                            <th>Schedule</th>
                                            <th>Performance</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ads.length > 0 ? ads.map((ad) => (
                                            <tr key={ad.id}>
                                                <td>
                                                    <strong>{ad.name}</strong>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                        Type: {ad.ad_type === 'BA' ? 'Banner Ad' : 'Carousel Ad'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: '600' }}>{ad.target_page_display || ad.target_page}</div>
                                                    <span style={{ fontSize: '0.8rem', color: '#2563eb' }}>{ad.package_display || ad.package}</span>
                                                </td>
                                                <td>
                                                    {ad.contact_number}<br/>
                                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{ad.contact_email}</span>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: '0.85rem' }}>
                                                        {ad.start_date || 'Immediate'} &rarr; {ad.end_date || 'Ongoing'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '0.85rem' }}>
                                                        👁️ {ad.impressions || 0} | 🖱️ {ad.clicks || 0}<br/>
                                                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>CTR: {ad.ctr || 0}%</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`admin-badge ${ad.status === 'active' ? 'approved' : ad.status === 'rejected' ? 'rejected' : ad.status === 'revision_requested' ? 'pending' : 'pending'}`}>
                                                        {ad.status === 'active' ? 'Active' : ad.status === 'rejected' ? 'Rejected' : ad.status === 'revision_requested' ? 'Revision Requested' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td style={{ display: 'flex', gap: '6px' }}>
                                                    <button onClick={() => openPreview(ad)} className="admin-action-btn" style={{ background: '#f1f5f9', color: '#475569' }} title="Preview Image">
                                                        <MdImage />
                                                    </button>

                                                    {ad.status !== 'active' && (
                                                        <button onClick={() => handleAction(ad.id, 'approve')} className="admin-action-btn approve" title="Approve">
                                                            <MdCheck />
                                                        </button>
                                                    )}

                                                    <button onClick={() => openRevisionModal(ad.id)} className="admin-action-btn" style={{ background: '#e0e7ff', color: '#4338ca' }} title="Request Revision">
                                                        <MdEditNote />
                                                    </button>

                                                    {ad.status !== 'rejected' && (
                                                        <button onClick={() => openRejectModal(ad.id)} className="admin-action-btn reject" title="Reject">
                                                            <MdClose />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center' }}>No advertisements found matching filter.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Rejection Modal */}
            {rejectModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '450px', maxWidth: '90%' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Reject Advertisement</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>Please provide a clear reason for rejecting this ad.</p>
                        <textarea 
                            value={modalNotes}
                            onChange={(e) => setModalNotes(e.target.value)}
                            rows="4"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', marginBottom: '20px' }}
                            placeholder="e.g. Image violates quality guidelines..."
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setRejectModalOpen(false)} style={{ padding: '8px 15px', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={submitReject} style={{ padding: '8px 15px', border: 'none', background: '#ef4444', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Reject Ad</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Revision Requested Modal */}
            {revisionModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '450px', maxWidth: '90%' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Request Campaign Revision</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>Specify required changes for the advertiser to update.</p>
                        <textarea 
                            value={modalNotes}
                            onChange={(e) => setModalNotes(e.target.value)}
                            rows="4"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', marginBottom: '20px' }}
                            placeholder="e.g. Please re-upload banner with higher text contrast..."
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setRevisionModalOpen(false)} style={{ padding: '8px 15px', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={submitRevision} style={{ padding: '8px 15px', border: 'none', background: '#4338ca', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Send Revision Request</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewModalOpen && previewData && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', width: '700px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px' }}>{previewData.name} ({previewData.target_page_display || previewData.target_page})</h2>
                            <button onClick={() => setPreviewModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}><MdClose /></button>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <img src={previewData.ad_image.startsWith('http') ? previewData.ad_image : `${djangoApi}${previewData.ad_image}`} alt={previewData.ad_image_alt || "Ad Preview"} style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAds;
