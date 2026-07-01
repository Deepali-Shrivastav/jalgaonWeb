import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import './admin.css';

const AdminNewsComments = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${djangoApi}/api/v1/news/admin/comments/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(response.data.results || response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching comments:", err);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${djangoApi}/api/v1/news/admin/comments/${id}/`, 
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchComments();
        } catch (err) {
            console.error(`Error updating comment to ${status}:`, err);
            alert("Failed to update comment status.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this comment permanently?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${djangoApi}/api/v1/news/admin/comments/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setComments(comments.filter(c => c.id !== id));
            } catch (err) {
                console.error("Error deleting comment:", err);
            }
        }
    };

    if (loading) return <div className="admin-loading">Loading...</div>;

    return (
        <div className="admin-content-card">
            <div className="admin-header-actions">
                <h2>Comment Moderation</h2>
            </div>
            
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Article</th>
                            <th>Comment</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <tr key={comment.id}>
                                    <td><strong>{comment.user_name}</strong></td>
                                    <td>{comment.article_title}</td>
                                    <td><div className="truncate-text" style={{maxWidth: '300px'}}>{comment.body}</div></td>
                                    <td>
                                        <span className={`badge ${comment.status === 'approved' ? 'success' : comment.status === 'rejected' ? 'danger' : 'warning'}`}>
                                            {comment.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="admin-actions-cell">
                                            {comment.status !== 'approved' && (
                                                <button className="admin-icon-btn success" title="Approve" onClick={() => handleStatusUpdate(comment.id, 'approved')}>
                                                    <FiCheck />
                                                </button>
                                            )}
                                            {comment.status !== 'rejected' && (
                                                <button className="admin-icon-btn warning" title="Reject" onClick={() => handleStatusUpdate(comment.id, 'rejected')}>
                                                    <FiX />
                                                </button>
                                            )}
                                            <button className="admin-icon-btn danger" title="Delete" onClick={() => handleDelete(comment.id)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">No comments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminNewsComments;
