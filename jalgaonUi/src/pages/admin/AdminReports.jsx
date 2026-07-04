import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdCheck, MdClose } from 'react-icons/md';

const AdminReports = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [statusMsg, setStatusMsg] = useState('');

    const fetchReports = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(
                `${djangoApi}/api/v1/admin-panel/business-reports/?status=${statusFilter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(response.data.results || response.data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [statusFilter]);

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this report?`)) return;
        
        const token = localStorage.getItem('token');
        try {
            const response = await axios.patch(
                `${djangoApi}/api/v1/admin-panel/business-reports/${id}/`,
                { action: action },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatusMsg(response.data.message || `Report ${action}ed successfully.`);
            fetchReports();
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
                    <h3 style={{ margin: 0 }}>Business Reports</h3>
                    <div className="admin-table-filter">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                            <option value="dismissed">Dismissed</option>
                        </select>
                    </div>
                </div>
                
                <div className="admin-table-wrapper">
                    {loading ? (
                        <div className="admin-loader">Loading reports...</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Business</th>
                                    <th>Reported By</th>
                                    <th>Reason</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.length > 0 ? reports.map((report) => (
                                    <tr key={report.id}>
                                        <td><strong>{report.business_name}</strong></td>
                                        <td>
                                            {report.reporter_name} <br/>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{report.reporter_phone}</span>
                                        </td>
                                        <td>
                                            <strong>{report.reason}</strong><br/>
                                            {report.description && <span style={{ fontSize: '0.85rem' }}>{report.description}</span>}
                                        </td>
                                        <td>{new Date(report.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`admin-badge ${report.status}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td style={{ display: 'flex', gap: '10px' }}>
                                            {report.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleAction(report.id, 'resolve')} className="admin-action-btn approve" title="Resolve">
                                                        <MdCheck /> Resolve
                                                    </button>
                                                    <button onClick={() => handleAction(report.id, 'dismiss')} className="admin-action-btn reject" title="Dismiss">
                                                        <MdClose /> Dismiss
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center' }}>No reports found.</td>
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

export default AdminReports;
