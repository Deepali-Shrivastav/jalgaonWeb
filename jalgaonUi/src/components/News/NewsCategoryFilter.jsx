import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NewsCategoryFilter.css';

const NewsCategoryFilter = ({ currentCategory, onCategoryChange }) => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/news/categories/`);
                setCategories(response.data.results || response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setLoading(false);
            }
        };
        fetchCategories();
    }, [djangoApi]);

    if (loading) return null;

    return (
        <div className="news-category-filter">
            <button 
                className={`category-pill ${!currentCategory ? 'active' : ''}`}
                onClick={() => onCategoryChange(null)}
            >
                All
            </button>
            {categories.map((category) => (
                <button 
                    key={category.id}
                    className={`category-pill ${currentCategory === category.slug ? 'active' : ''}`}
                    onClick={() => onCategoryChange(category.slug)}
                >
                    {category.name}
                </button>
            ))}
        </div>
    );
};

export default NewsCategoryFilter;
