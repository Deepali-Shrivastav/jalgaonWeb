import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './admin.css';

const AdminNewsCreate = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const navigate = useNavigate();
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        short_description: '',
        content: '',
        category: '',
        status: 'draft',
        is_breaking: false,
        meta_title: '',
        meta_description: ''
    });
    
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        // Fetch categories for dropdown
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/news/categories/`);
                setCategories(response.data.results || response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();

        // Fetch article if edit mode
        if (isEditMode) {
            const fetchArticle = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${djangoApi}/api/v1/news/admin/articles/${id}/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = response.data;
                    setFormData({
                        title: data.title || '',
                        short_description: data.short_description || '',
                        content: data.content || '',
                        category: data.category ? data.category.id : (data.category || ''),
                        status: data.status || 'draft',
                        is_breaking: data.is_breaking || false,
                        meta_title: data.meta_title || '',
                        meta_description: data.meta_description || ''
                    });
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching article for edit:", error);
                    alert("Failed to load article.");
                    navigate('/admin/news');
                }
            };
            fetchArticle();
        }
    }, [id, isEditMode, djangoApi, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const token = localStorage.getItem('token');
            const url = isEditMode 
                ? `${djangoApi}/api/v1/news/admin/articles/${id}/` 
                : `${djangoApi}/api/v1/news/admin/articles/`;
            
            const method = isEditMode ? 'put' : 'post';
            
            // Build FormData for multipart/form-data upload
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    // For category, if it's an object (from DRF related field), extract ID
                    const value = (key === 'category' && typeof formData[key] === 'object') ? formData[key].id : formData[key];
                    data.append(key, value);
                }
            });
            
            if (imageFile) {
                data.append('featured_image', imageFile);
            }
            
            await axios({
                method: method,
                url: url,
                data: data,
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            navigate('/admin/news');
        } catch (error) {
            console.error("Error saving article:", error);
            alert("Failed to save article. Please check all required fields.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="admin-loading">Loading...</div>;

    return (
        <div className="admin-content-card">
            <div className="admin-header-actions">
                <h2>{isEditMode ? 'Edit Article' : 'Create New Article'}</h2>
                <button className="admin-btn" onClick={() => navigate('/admin/news')}>Back to List</button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                    <label>Title *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required className="admin-input" />
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="admin-select">
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="admin-select">
                            <option value="draft">Draft</option>
                            <option value="review">Review</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                </div>
                
                <div className="form-group">
                    <label>Short Description *</label>
                    <textarea name="short_description" value={formData.short_description} onChange={handleChange} required className="admin-textarea" rows="2" />
                </div>
                
                <div className="form-group">
                    <label>Content (Full Article) *</label>
                    <textarea name="content" value={formData.content} onChange={handleChange} required className="admin-textarea" rows="15" />
                    <small>Separate paragraphs with a blank line.</small>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Featured Image {isEditMode ? '(Leave empty to keep existing)' : '*'}</label>
                        <input type="file" onChange={handleImageChange} accept="image/*" required={!isEditMode} className="admin-file-input" />
                    </div>
                    
                    <div className="form-group flex-center-vertical mt-4">
                        <label className="checkbox-label">
                            <input type="checkbox" name="is_breaking" checked={formData.is_breaking} onChange={handleChange} />
                            Mark as Breaking News
                        </label>
                    </div>
                </div>
                
                <h3 className="section-subtitle mt-4">SEO Metadata</h3>
                <div className="form-group">
                    <label>SEO Title (Optional)</label>
                    <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} className="admin-input" placeholder="Leave empty to use article title" />
                </div>
                
                <div className="form-group">
                    <label>SEO Description (Optional)</label>
                    <textarea name="meta_description" value={formData.meta_description} onChange={handleChange} className="admin-textarea" rows="2" placeholder="Leave empty to use short description" />
                </div>
                
                <div className="form-actions mt-4">
                    <button type="submit" className="admin-btn primary w-full" disabled={saving}>
                        {saving ? 'Saving...' : (isEditMode ? 'Update Article' : 'Publish Article')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminNewsCreate;
