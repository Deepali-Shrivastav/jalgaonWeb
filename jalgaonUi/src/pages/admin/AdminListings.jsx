import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdCheck, MdClose, MdDelete, MdSearch, MdVisibility } from 'react-icons/md';

const AdminListings = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [statusMsg, setStatusMsg] = useState('');

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState([]);

    // Modal states
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [targetRejectId, setTargetRejectId] = useState(null); // null means bulk reject

    const fetchListings = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(
                `${djangoApi}/api/v1/admin-panel/listings/?search=${searchTerm}&status=${statusFilter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setListings(response.data.results || response.data);
            setSelectedIds([]); // Reset selection on fetch
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

    // Action handlers
    const handleAction = async (id, action, reason = '') => {
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
                    { action: action, rejection_reason: reason },
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

    // Bulk Action Handlers
    const handleBulkAction = async (action, reason = '') => {
        if (selectedIds.length === 0) return;
        if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedIds.length} listings?`)) return;

        const token = localStorage.getItem('token');
        let successCount = 0;
        
        // simple loop approach for bulk
        setLoading(true);
        for (const id of selectedIds) {
            try {
                if (action === 'delete') {
                    await axios.delete(`${djangoApi}/api/v1/admin-panel/listings/${id}/`, { headers: { Authorization: `Bearer ${token}` }});
                } else {
                    await axios.patch(`${djangoApi}/api/v1/admin-panel/listings/${id}/`, { action, rejection_reason: reason }, { headers: { Authorization: `Bearer ${token}` }});
                }
                successCount++;
            } catch (err) {
                console.error(`Failed bulk ${action} on ID ${id}`, err);
            }
        }
        
        setStatusMsg(`Successfully processed ${successCount} of ${selectedIds.length} items.`);
        fetchListings();
        setTimeout(() => setStatusMsg(''), 3000);
    };

    // Reject Modal Handlers
    const openRejectModal = (id = null) => {
        setTargetRejectId(id);
        setRejectionReason('');
        setRejectModalOpen(true);
    };

    const submitReject = () => {
        if (targetRejectId) {
            handleAction(targetRejectId, 'reject', rejectionReason);
        } else {
            handleBulkAction('reject', rejectionReason);
        }
        setRejectModalOpen(false);
    };

    // Preview Modal Handlers
    const openPreview = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${djangoApi}/api/v1/admin-panel/listings/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPreviewData(res.data);
            setPreviewModalOpen(true);
        } catch (err) {
            setStatusMsg("Failed to load preview");
            setTimeout(() => setStatusMsg(''), 3000);
        }
    };

    const toggleSelection = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(listings.map(l => l.id));
        } else {
            setSelectedIds([]);
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
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
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
                                <option value="active">Active</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                    
                    {selectedIds.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <span style={{ alignSelf: 'center', color: '#64748b', fontSize: '13px', marginRight: '10px' }}>
                                {selectedIds.length} selected
                            </span>
                            <button onClick={() => handleBulkAction('approve')} className="action_btn btn_primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                                Bulk Approve
                            </button>
                            <button onClick={() => openRejectModal(null)} className="action_btn" style={{ padding: '6px 12px', fontSize: '13px', background: '#fee2e2', color: '#b91c1c' }}>
                                Bulk Reject
                            </button>
                            <button onClick={() => handleBulkAction('delete')} className="action_btn" style={{ padding: '6px 12px', fontSize: '13px', background: '#f1f5f9', color: '#475569' }}>
                                Bulk Delete
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="admin-table-wrapper">
                    {loading ? (
                        <div className="admin-loader">Loading listings...</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input 
                                            type="checkbox" 
                                            onChange={toggleSelectAll} 
                                            checked={listings.length > 0 && selectedIds.length === listings.length} 
                                        />
                                    </th>
                                    <th>Business Name</th>
                                    <th>Category</th>
                                    <th>Owner</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.length > 0 ? listings.map((l) => (
                                    <tr key={l.id} className={selectedIds.includes(l.id) ? 'selected-row' : ''}>
                                        <td>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(l.id)}
                                                onChange={() => toggleSelection(l.id)} 
                                            />
                                        </td>
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
                                            <span className={`admin-badge ${l.status === 'active' ? 'approved' : l.status === 'rejected' ? 'rejected' : 'pending'}`}>
                                                {l.status === 'active' ? 'Active' : l.status === 'rejected' ? 'Rejected' : 'Pending'}
                                            </span>
                                        </td>
                                        <td style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => openPreview(l.id)} className="admin-action-btn" style={{ background: '#f1f5f9', color: '#475569' }} title="Preview">
                                                <MdVisibility />
                                            </button>
                                            {l.status !== 'active' && (
                                                <button onClick={() => handleAction(l.id, 'approve')} className="admin-action-btn approve" title="Approve">
                                                    <MdCheck />
                                                </button>
                                            )}
                                            {l.status !== 'rejected' && (
                                                <button onClick={() => openRejectModal(l.id)} className="admin-action-btn reject" title="Reject">
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
                                        <td colSpan="6" style={{ textAlign: 'center' }}>No listings found.</td>
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
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Reject Listing{targetRejectId ? '' : 's (Bulk)'}</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Please provide a reason for rejection (optional but recommended).</p>
                        <textarea 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows="4"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', marginBottom: '20px' }}
                            placeholder="e.g. Does not meet community guidelines..."
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
                    <div style={{ background: '#fff', padding: '0', borderRadius: '12px', width: '600px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                            <h2 style={{ margin: 0, fontSize: '20px' }}>Listing Preview</h2>
                            <button onClick={() => setPreviewModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}><MdClose /></button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            {previewData.business_banner && (
                                <img src={previewData.business_banner.startsWith('http') ? previewData.business_banner : `${djangoApi}${previewData.business_banner}`} alt={previewData.business_banner_alt || "Banner"} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px' }} />
                            )}
                            
                            <h1 style={{ fontSize: '24px', marginBottom: '5px' }}>{previewData.business_name}</h1>
                            <p style={{ color: '#0081C7', fontWeight: 'bold', marginBottom: '20px' }}>{previewData.main_category_name} {previewData.sub_category_name ? `> ${previewData.sub_category_name}` : ''}</p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <h4 style={{ color: '#475569', marginBottom: '5px' }}>Contact Info</h4>
                                    <p style={{ fontSize: '14px', margin: '3px 0' }}><strong>Phone:</strong> {previewData.business_no}</p>
                                    <p style={{ fontSize: '14px', margin: '3px 0' }}><strong>Email:</strong> {previewData.business_email}</p>
                                    <p style={{ fontSize: '14px', margin: '3px 0' }}><strong>Address:</strong> {previewData.business_address}, {previewData.city}</p>
                                </div>
                                <div>
                                    <h4 style={{ color: '#475569', marginBottom: '5px' }}>Details</h4>
                                    <p style={{ fontSize: '14px', margin: '3px 0' }}><strong>Status:</strong> <span style={{textTransform: 'uppercase'}}>{previewData.status}</span></p>
                                    <p style={{ fontSize: '14px', margin: '3px 0' }}><strong>Established:</strong> {previewData.business_dob}</p>
                                    <p style={{ fontSize: '14px', margin: '3px 0' }}><strong>GST:</strong> {previewData.business_gst}</p>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ color: '#475569', marginBottom: '5px' }}>Description</h4>
                                <p style={{ fontSize: '14px', lineHeight: '1.6', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                                    {previewData.business_description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminListings;
