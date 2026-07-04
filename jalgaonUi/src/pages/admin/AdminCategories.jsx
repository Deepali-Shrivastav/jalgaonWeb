import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const AdminCategories = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryImage, setNewCategoryImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    // Subcategory state
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);
    
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState(null);
    const [newSubCategoryName, setNewSubCategoryName] = useState('');
    const [newSubCategoryImage, setNewSubCategoryImage] = useState(null);

    const fetchCategories = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${djangoApi}/api/v1/admin-panel/categories/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName) {
            setErrorMsg("Category name is required");
            return;
        }

        setSubmitting(true);
        setErrorMsg('');
        const token = localStorage.getItem('token');
        
        const formData = new FormData();
        formData.append('main_category', newCategoryName);
        if (newCategoryImage) {
            formData.append('category_img', newCategoryImage);
        }

        try {
            await axios.post(`${djangoApi}/api/v1/admin-panel/categories/`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setIsAddModalOpen(false);
            setNewCategoryName('');
            setNewCategoryImage(null);
            fetchCategories();
        } catch (error) {
            console.error("Failed to add category", error);
            setErrorMsg(error.response?.data?.error || "Failed to create category");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName) {
            setErrorMsg("Category name is required");
            return;
        }

        setSubmitting(true);
        setErrorMsg('');
        const token = localStorage.getItem('token');
        
        const formData = new FormData();
        formData.append('main_category', newCategoryName);
        if (newCategoryImage) {
            formData.append('category_img', newCategoryImage);
        }

        try {
            await axios.patch(`${djangoApi}/api/v1/admin-panel/categories/${editingCategory.id}/`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setIsEditModalOpen(false);
            setEditingCategory(null);
            setNewCategoryName('');
            setNewCategoryImage(null);
            fetchCategories();
        } catch (error) {
            console.error("Failed to edit category", error);
            setErrorMsg(error.response?.data?.error || "Failed to edit category");
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setNewCategoryName(category.main_category);
        setNewCategoryImage(null); // Reset image on open
        setIsEditModalOpen(true);
        setErrorMsg('');
    };

    const toggleExpand = async (catId) => {
        if (expandedCategory === catId) {
            setExpandedCategory(null);
            return;
        }
        
        setExpandedCategory(catId);
        setLoadingSubcategories(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${djangoApi}/api/v1/admin-panel/categories/${catId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubcategories(response.data.subcategories || []);
        } catch (error) {
            console.error("Failed to fetch subcategories", error);
        } finally {
            setLoadingSubcategories(false);
        }
    };

    const handleSubCategorySubmit = async (e) => {
        e.preventDefault();
        if (!newSubCategoryName) {
            setErrorMsg("Subcategory name is required");
            return;
        }

        setSubmitting(true);
        setErrorMsg('');
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('sub_category', newSubCategoryName);
        if (newSubCategoryImage) {
            formData.append('sub_category_img', newSubCategoryImage);
        }

        try {
            if (editingSubCategory) {
                await axios.patch(`${djangoApi}/api/v1/admin-panel/subcategories/${editingSubCategory.id}/`, formData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
            } else {
                formData.append('main_category', expandedCategory);
                await axios.post(`${djangoApi}/api/v1/admin-panel/subcategories/`, formData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
            }
            
            setIsSubModalOpen(false);
            setEditingSubCategory(null);
            setNewSubCategoryName('');
            setNewSubCategoryImage(null);
            toggleExpand(expandedCategory); // Refetch subcategories
            fetchCategories(); // Refetch categories to update count
        } catch (error) {
            console.error("Failed to save subcategory", error);
            setErrorMsg(error.response?.data?.error || "Failed to save subcategory");
        } finally {
            setSubmitting(false);
        }
    };

    const openAddSubModal = () => {
        setEditingSubCategory(null);
        setNewSubCategoryName('');
        setNewSubCategoryImage(null);
        setIsSubModalOpen(true);
        setErrorMsg('');
    };

    const openEditSubModal = (sub) => {
        setEditingSubCategory(sub);
        setNewSubCategoryName(sub.sub_category);
        setNewSubCategoryImage(null);
        setIsSubModalOpen(true);
        setErrorMsg('');
    };

    return (
        <div>
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 style={{ margin: 0 }}>Category Management</h3>
                    <button onClick={() => setIsAddModalOpen(true)} className="admin-btn primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MdAdd /> Add Category
                    </button>
                </div>
                
                <div className="admin-table-wrapper">
                    {loading ? (
                        <div className="admin-loader">Loading categories...</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Logo</th>
                                    <th>Category Name</th>
                                    <th>Subcategories</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length > 0 ? categories.map((cat) => (
                                    <React.Fragment key={cat.id}>
                                        <tr style={{ background: expandedCategory === cat.id ? '#f8fafc' : 'white' }}>
                                            <td>#{cat.id}</td>
                                            <td>
                                                {cat.category_img ? (
                                                    <img src={`${djangoApi}${cat.category_img}`} alt={cat.main_category} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                ) : (
                                                    <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '4px' }}></div>
                                                )}
                                            </td>
                                            <td><strong>{cat.main_category}</strong></td>
                                            <td>
                                                <button onClick={() => toggleExpand(cat.id)} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                                    {expandedCategory === cat.id ? 'Hide' : 'View'} {cat.subcategories_count} subcategories
                                                </button>
                                            </td>
                                            <td style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => openEditModal(cat)} className="admin-action-btn edit" title="Edit">
                                                    <MdEdit />
                                                </button>
                                                <button className="admin-action-btn delete" title="Delete">
                                                    <MdDelete />
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedCategory === cat.id && (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '0' }}>
                                                    <div style={{ padding: '20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                            <h4 style={{ margin: 0, color: '#334155' }}>Subcategories for {cat.main_category}</h4>
                                                            <button onClick={openAddSubModal} className="admin-btn" style={{ background: '#3b82f6', color: '#fff', fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <MdAdd /> Add Subcategory
                                                            </button>
                                                        </div>
                                                        {loadingSubcategories ? (
                                                            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Loading...</p>
                                                        ) : subcategories.length > 0 ? (
                                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                                {subcategories.map(sub => (
                                                                    <div key={sub.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}>
                                                                        {sub.sub_category_img && (
                                                                            <img src={`${djangoApi}${sub.sub_category_img}`} style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} alt={sub.sub_category} />
                                                                        )}
                                                                        <div style={{ flex: 1 }}>
                                                                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{sub.sub_category}</span>
                                                                        </div>
                                                                        <button onClick={() => openEditSubModal(sub)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><MdEdit /></button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>No subcategories found.</p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center' }}>No categories found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add Category Modal */}
            {isAddModalOpen && (
                <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="admin-modal-content" style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
                        <h3 style={{ marginTop: 0 }}>Add New Category</h3>
                        {errorMsg && <div style={{ color: 'red', marginBottom: '10px' }}>{errorMsg}</div>}
                        <form onSubmit={handleAddCategory}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Category Name *</label>
                                <input 
                                    type="text" 
                                    value={newCategoryName} 
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Category Logo (Optional)</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setNewCategoryImage(e.target.files[0])}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="admin-btn" style={{ background: '#e2e8f0', color: '#333' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="admin-btn primary">
                                    {submitting ? 'Creating...' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {isEditModalOpen && (
                <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="admin-modal-content" style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
                        <h3 style={{ marginTop: 0 }}>Edit Category</h3>
                        {errorMsg && <div style={{ color: 'red', marginBottom: '10px' }}>{errorMsg}</div>}
                        <form onSubmit={handleEditCategory}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Category Name *</label>
                                <input 
                                    type="text" 
                                    value={newCategoryName} 
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Category Logo (Leave empty to keep current, optional)</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setNewCategoryImage(e.target.files[0])}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="admin-btn" style={{ background: '#e2e8f0', color: '#333' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="admin-btn primary">
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SubCategory Modal */}
            {isSubModalOpen && (
                <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="admin-modal-content" style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
                        <h3 style={{ marginTop: 0 }}>{editingSubCategory ? 'Edit Subcategory' : 'Add Subcategory'}</h3>
                        {errorMsg && <div style={{ color: 'red', marginBottom: '10px' }}>{errorMsg}</div>}
                        <form onSubmit={handleSubCategorySubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Subcategory Name *</label>
                                <input 
                                    type="text" 
                                    value={newSubCategoryName} 
                                    onChange={(e) => setNewSubCategoryName(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Subcategory Image {editingSubCategory ? '(Leave empty to keep current)' : '*'}</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setNewSubCategoryImage(e.target.files[0])}
                                    required={!editingSubCategory}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsSubModalOpen(false)} className="admin-btn" style={{ background: '#e2e8f0', color: '#333' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="admin-btn primary">
                                    {submitting ? 'Saving...' : 'Save Subcategory'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
