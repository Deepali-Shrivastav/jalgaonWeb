import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Services.css'
import axios from 'axios';

function Services() {
    const djangoApi = import.meta.env.VITE_DJANGO_API;

    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`${djangoApi}/api/v1/listings/categories/`)
            .then(response => {
                setCategories(response.data.results || response.data.categories || response.data);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }, []);
    return (
        <div className="services_container">
            <div className="services_cards">
                {categories.map(category => (
                    <Link to={`/categories/${category.id}/${category.main_category}`}>
                    <div key={category.id} className="service">
                        <img src={category.category_img.category_img.startsWith('http') ? category.category_img.category_img : `${djangoApi}${category.category_img.category_img}`} alt={category.category_img.img_name} />
                        <p>{category.main_category}</p>
                    </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Services

