import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import './admin.css';

const AdminNewsCategories = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        slug: '',
        description: '',
        sort_order: 0
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${djangoApi}/api/v1/news/admin/categories/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data.results || response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching news categories:", err);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Auto-generate slug from name if creating new
            ...(name === 'name' && !prev.id ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (formData.id) {
                await axios.put(`${djangoApi}/api/v1/news/admin/categories/${formData.id}/`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${djangoApi}/api/v1/news/admin/categories/`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchCategories();
            setIsFormOpen(false);
            setFormData({ id: null, name: '', slug: '', description: '', sort_order: 0 });
        } catch (err) {
            console.error("Error saving category:", err);
            alert("Failed to save category. Please check your inputs.");
        }
    };

    const handleEdit = (category) => {
        setFormData(category);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${djangoApi}/api/v1/news/admin/categories/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchCategories();
            } catch (err) {
                console.error("Error deleting category:", err);
                alert("Failed to delete category.");
            }
        }
    };

    if (loading) return <div className="admin-loading">Loading...</div>;

    return (
        <div className="admin-content-card">
            <div className="admin-header-actions">
                <h2>News Categories</h2>
                <button className="admin-btn primary" onClick={() => {
                    setFormData({ id: null, name: '', slug: '', description: '', sort_order: 0 });
                    setIsFormOpen(!isFormOpen);
                }}>
                    {isFormOpen ? 'Cancel' : <><FiPlus /> New Category</>}
                </button>
            </div>
            
            {isFormOpen && (
                <form onSubmit={handleSubmit} className="admin-form" style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Name *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="admin-input" />
                        </div>
                        <div className="form-group">
                            <label>Slug *</label>
                            <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="admin-input" />
                        </div>
                        <div className="form-group" style={{ flex: '0.5' }}>
                            <label>Sort Order</label>
                            <input type="number" name="sort_order" value={formData.sort_order} onChange={handleChange} className="admin-input" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="admin-textarea" rows="2" />
                    </div>
                    <button type="submit" className="admin-btn primary">
                        {formData.id ? 'Update Category' : 'Create Category'}
                    </button>
                </form>
            )}

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Slug</th>
                            <th>Sort Order</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length > 0 ? (
                            categories.map(category => (
                                <tr key={category.id}>
                                    <td><strong>{category.name}</strong></td>
                                    <td>{category.slug}</td>
                                    <td>{category.sort_order}</td>
                                    <td>
                                        <div className="admin-actions-cell">
                                            <button className="admin-icon-btn" onClick={() => handleEdit(category)}>
                                                <FiEdit />
                                            </button>
                                            <button className="admin-icon-btn danger" onClick={() => handleDelete(category.id)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">No categories found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminNewsCategories;
