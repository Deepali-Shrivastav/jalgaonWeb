import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EventCategoryFilter.css';

const EventCategoryFilter = ({ currentCategory, onCategoryChange }) => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/events/categories/`);
                setCategories(response.data.results || response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching event categories:", error);
                setLoading(false);
            }
        };
        fetchCategories();
    }, [djangoApi]);

    if (loading) return null;

    return (
        <div className="event-category-filter">
            <button 
                className={`event-category-pill ${!currentCategory ? 'active' : ''}`}
                onClick={() => onCategoryChange(null)}
            >
                All Events
            </button>
            {categories.map((category) => (
                <button 
                    key={category.id}
                    className={`event-category-pill ${currentCategory === category.slug ? 'active' : ''}`}
                    onClick={() => onCategoryChange(category.slug)}
                >
                    {category.name}
                </button>
            ))}
        </div>
    );
};

export default EventCategoryFilter;
