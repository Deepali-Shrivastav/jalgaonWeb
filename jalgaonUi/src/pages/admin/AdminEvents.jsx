import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheck, FiX, FiStar, FiEye, FiTrash2 } from 'react-icons/fi';
import './admin.css';

const AdminEvents = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [actionMsg, setActionMsg] = useState('');

    const fetchAdminEvents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${djangoApi}/api/v1/events/admin/events/?status=${statusFilter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(response.data.results || response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching admin events:", err);
            setError("Failed to load events. Content Manager permission required.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminEvents();
    }, [statusFilter]);

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${djangoApi}/api/v1/events/admin/events/${id}/approve/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActionMsg("Event approved successfully.");
            fetchAdminEvents();
            setTimeout(() => setActionMsg(''), 3000);
        } catch (err) {
            console.error("Approve error:", err);
            alert("Failed to approve event.");
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Enter rejection reason for the submitter:");
        if (!reason) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${djangoApi}/api/v1/events/admin/events/${id}/reject/`, 
                { rejection_reason: reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setActionMsg("Event rejected.");
            fetchAdminEvents();
            setTimeout(() => setActionMsg(''), 3000);
        } catch (err) {
            console.error("Reject error:", err);
            alert(err.response?.data?.error || "Failed to reject event.");
        }
    };

    const handleToggleFeature = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${djangoApi}/api/v1/events/admin/events/${id}/feature/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAdminEvents();
        } catch (err) {
            console.error("Feature toggle error:", err);
            alert("Failed to toggle feature flag. Admin role required.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this event permanently?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${djangoApi}/api/v1/events/admin/events/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEvents(events.filter(e => e.id !== id));
            } catch (err) {
                console.error("Delete error:", err);
                alert("Failed to delete event.");
            }
        }
    };

    return (
        <div className="admin-content-card">
            <div className="admin-header-actions">
                <h2>Event Moderation & Management</h2>
                <div className="admin-table-filter">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="pending">Pending Review</option>
                        <option value="approved">Approved Events</option>
                        <option value="rejected">Rejected Events</option>
                        <option value="cancelled">Cancelled Events</option>
                    </select>
                </div>
            </div>

            {actionMsg && (
                <div style={{ padding: '10px 16px', background: '#dcfce7', color: '#166534', marginBottom: '16px', borderRadius: '6px' }}>
                    {actionMsg}
                </div>
            )}

            {loading ? (
                <div className="admin-loading">Loading events queue...</div>
            ) : error ? (
                <div className="admin-error">{error}</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Event Title</th>
                                <th>Venue</th>
                                <th>Start Date</th>
                                <th>Organizer</th>
                                <th>Featured</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.length > 0 ? (
                                events.map(event => (
                                    <tr key={event.id}>
                                        <td>
                                            <strong>{event.title}</strong>
                                            {event.rejection_reason && (
                                                <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '2px' }}>
                                                    Reason: {event.rejection_reason}
                                                </div>
                                            )}
                                        </td>
                                        <td>{event.venue_name}</td>
                                        <td>{new Date(event.start_datetime).toLocaleDateString()}</td>
                                        <td>{event.organizer_name}</td>
                                        <td>
                                            <button 
                                                className={`admin-icon-btn ${event.is_featured ? 'active' : ''}`}
                                                onClick={() => handleToggleFeature(event.id)}
                                                title="Toggle Featured"
                                                style={{ color: event.is_featured ? '#f59e0b' : '#cbd5e1' }}
                                            >
                                                <FiStar />
                                            </button>
                                        </td>
                                        <td>
                                            <span className={`status-select ${event.status}`}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-actions-cell" style={{ display: 'flex', gap: '6px' }}>
                                                {event.status === 'pending' && (
                                                    <>
                                                        <button 
                                                            className="admin-action-btn approve" 
                                                            onClick={() => handleApprove(event.id)}
                                                            title="Approve Event"
                                                        >
                                                            <FiCheck /> Approve
                                                        </button>
                                                        <button 
                                                            className="admin-action-btn reject" 
                                                            onClick={() => handleReject(event.id)}
                                                            title="Reject Event"
                                                        >
                                                            <FiX /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                <a 
                                                    href={`/events/${event.slug}`} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="admin-icon-btn"
                                                    title="View Public Event Page"
                                                >
                                                    <FiEye />
                                                </a>
                                                <button 
                                                    className="admin-icon-btn danger" 
                                                    onClick={() => handleDelete(event.id)}
                                                    title="Delete Event"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center">No events found in this status filter.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminEvents;
