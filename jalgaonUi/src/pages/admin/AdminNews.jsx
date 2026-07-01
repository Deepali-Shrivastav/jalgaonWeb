import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiPlus, FiEye } from 'react-icons/fi';
import './admin.css'; // Using existing admin CSS

const AdminNews = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${djangoApi}/api/v1/news/admin/articles/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setArticles(response.data.results || response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching admin articles:", err);
            setError("Failed to load articles. Please ensure you have the required permissions.");
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${djangoApi}/api/v1/news/admin/articles/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setArticles(articles.filter(article => article.id !== id));
            } catch (err) {
                console.error("Error deleting article:", err);
                alert("Failed to delete article. Only admins can delete articles.");
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${djangoApi}/api/v1/news/admin/articles/${id}/status/`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Refresh list
            fetchArticles();
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status. Please ensure you have Content Manager permissions.");
        }
    };

    if (loading) return <div className="admin-loading">Loading...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-content-card">
            <div className="admin-header-actions">
                <h2>News Articles</h2>
                <button className="admin-btn primary" onClick={() => navigate('/admin/news/create')}>
                    <FiPlus /> New Article
                </button>
            </div>
            
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Views</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.length > 0 ? (
                            articles.map(article => (
                                <tr key={article.id}>
                                    <td>
                                        <div className="admin-title-cell">
                                            {article.is_breaking && <span className="badge danger">Breaking</span>}
                                            {article.title}
                                        </div>
                                    </td>
                                    <td>
                                        <select 
                                            value={article.status} 
                                            onChange={(e) => handleStatusChange(article.id, e.target.value)}
                                            className={`status-select ${article.status}`}
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="review">Review</option>
                                            <option value="published">Published</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </td>
                                    <td>{new Date(article.created_at).toLocaleDateString()}</td>
                                    <td>{article.view_count || 0}</td>
                                    <td>
                                        <div className="admin-actions-cell">
                                            <a href={`/news/${article.slug}`} target="_blank" rel="noreferrer" className="admin-icon-btn">
                                                <FiEye />
                                            </a>
                                            <button className="admin-icon-btn" onClick={() => navigate(`/admin/news/edit/${article.id}`)}>
                                                <FiEdit />
                                            </button>
                                            <button className="admin-icon-btn danger" onClick={() => handleDelete(article.id)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">No articles found. Create one!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminNews;
