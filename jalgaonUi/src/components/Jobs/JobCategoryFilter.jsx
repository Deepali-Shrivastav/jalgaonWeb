import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './JobCategoryFilter.css';

const JobCategoryFilter = ({ currentCategory, onCategoryChange }) => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/jobs/categories/`);
                setCategories(response.data.results || response.data);
            } catch (error) {
                console.error("Error fetching job categories:", error);
            }
        };

        fetchCategories();
    }, [djangoApi]);

    return (
        <div className="job-category-filter">
            <button 
                className={`category-chip ${!currentCategory ? 'active' : ''}`}
                onClick={() => onCategoryChange(null)}
            >
                All Jobs
            </button>
            {categories.map(category => (
                <button 
                    key={category.id}
                    className={`category-chip ${currentCategory === category.slug ? 'active' : ''}`}
                    onClick={() => onCategoryChange(category.slug)}
                >
                    {category.name}
                </button>
            ))}
        </div>
    );
};

export default JobCategoryFilter;
