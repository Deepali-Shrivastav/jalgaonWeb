import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const AdminCategories = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div>
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 style={{ margin: 0 }}>Category Management</h3>
                    <button className="admin-btn primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                                    <th>Image</th>
                                    <th>Category Name</th>
                                    <th>Subcategories</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length > 0 ? categories.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>#{cat.id}</td>
                                        <td>
                                            {cat.category_img ? (
                                                <img src={`${djangoApi}${cat.category_img}`} alt={cat.main_category} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '4px' }}></div>
                                            )}
                                        </td>
                                        <td><strong>{cat.main_category}</strong></td>
                                        <td>{cat.subcategories_count} subcategories</td>
                                        <td style={{ display: 'flex', gap: '10px' }}>
                                            <button className="admin-action-btn edit" title="Edit">
                                                <MdEdit />
                                            </button>
                                            <button className="admin-action-btn delete" title="Delete">
                                                <MdDelete />
                                            </button>
                                        </td>
                                    </tr>
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
        </div>
    );
};

export default AdminCategories;
