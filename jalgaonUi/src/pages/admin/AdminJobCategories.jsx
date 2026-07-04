import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';

const AdminJobCategories = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        is_active: true,
        sort_order: 0
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${djangoApi}/api/v1/jobs/admin/categories/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data.results || response.data);
        } catch (error) {
            console.error("Error fetching job categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            const payload = { ...formData };
            if (payload.id) {
                await axios.put(`${djangoApi}/api/v1/jobs/admin/categories/${payload.id}/`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                delete payload.id;
                await axios.post(`${djangoApi}/api/v1/jobs/admin/categories/`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            setFormData({ id: null, name: '', is_active: true, sort_order: 0 });
            setIsEditing(false);
            fetchCategories();
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Failed to save category.");
        }
    };

    const handleEdit = (category) => {
        setFormData({
            id: category.id,
            name: category.name,
            is_active: category.is_active,
            sort_order: category.sort_order
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${djangoApi}/api/v1/jobs/admin/categories/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("Failed to delete category.");
        }
    };

    const cancelEdit = () => {
        setFormData({ id: null, name: '', is_active: true, sort_order: 0 });
        setIsEditing(false);
    };

    return (
        <div className="admin-page admin-job-categories-page">
            <div className="admin-page-header">
                <h2>Manage Job Categories</h2>
                {!isEditing && (
                    <button className="btn-primary" onClick={() => setIsEditing(true)}>
                        <MdAdd /> Add Category
                    </button>
                )}
            </div>

            {isEditing && (
                <div className="admin-content-card" style={{ marginBottom: '30px' }}>
                    <div className="admin-header-actions" style={{ marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, color: '#1e293b' }}>{formData.id ? 'Edit Category' : 'New Category'}</h3>
                    </div>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Category Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                className="admin-form-input"
                                value={formData.name} 
                                onChange={handleInputChange} 
                                required 
                                placeholder="e.g. Graphic Design"
                            />
                        </div>
                        <div className="form-row" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                            <div className="admin-form-group" style={{ flex: 1 }}>
                                <label className="admin-form-label">Sort Order</label>
                                <input 
                                    type="number" 
                                    name="sort_order" 
                                    className="admin-form-input"
                                    value={formData.sort_order} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            <div className="admin-form-group flex-center-vertical" style={{ marginTop: '28px', gap: '8px' }}>
                                <input 
                                    type="checkbox" 
                                    name="is_active" 
                                    id="is_active_check"
                                    checked={formData.is_active} 
                                    onChange={handleInputChange} 
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="is_active_check" className="admin-form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                                    Active Category
                                </label>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                            <button type="submit" className="admin-btn primary">Save Category</button>
                            <button type="button" className="admin-btn" onClick={cancelEdit} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-table-container">
                {loading ? (
                    <div className="admin-loading">Loading categories...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Status</th>
                                <th>Order</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center">No categories found.</td>
                                </tr>
                            ) : (
                                categories.map(cat => (
                                    <tr key={cat.id}>
                                        <td>{cat.name}</td>
                                        <td>{cat.slug}</td>
                                        <td>
                                            <span className={`status-badge ${cat.is_active ? 'active' : 'inactive'}`}>
                                                {cat.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>{cat.sort_order}</td>
                                        <td>
                                            <div className="admin-actions-cell">
                                                <button 
                                                    className="admin-icon-btn" 
                                                    onClick={() => handleEdit(cat)}
                                                >
                                                    <MdEdit />
                                                </button>
                                                <button 
                                                    className="admin-icon-btn danger" 
                                                    onClick={() => handleDelete(cat.id)}
                                                >
                                                    <MdDelete />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminJobCategories;
