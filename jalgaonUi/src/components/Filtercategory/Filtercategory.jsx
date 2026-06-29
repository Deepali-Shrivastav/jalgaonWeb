    import React, { useEffect, useState } from 'react';
    import './Filtercategory.css';
    import axios from 'axios';

    function Filtercategory({ mainCategoryId, mainCategory, setFilterSubCategory }) {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [subCategories, setSubCategories] = useState([]);

    useEffect(() => {
        if (mainCategory) {
        console.log(`Fetching sub-categories for main category: ${mainCategory}`);
        axios.get(`${djangoApi}/api/v1/listings/subcategories/`)
            .then(sub_response => {
            console.log('Sub-categories fetched:', sub_response.data);
            const filteredSubCategories = sub_response.data.categories.filter(
                subCategory => subCategory.main_category === mainCategory
            );
            console.log('Filtered sub-categories:', filteredSubCategories);
            setSubCategories(filteredSubCategories);
            })
            .catch(error => {
            console.error('Error fetching sub-categories:', error);
            });
        }
    }, [mainCategory, djangoApi]);

    const handleCategoryClick = (e, categoryId) => {
        e.preventDefault()
        console.log(`Category clicked: ${categoryId}`);
        setFilterSubCategory(categoryId);
    };

    return (
        <div className="filter_category">
        <div className="filter_btn">
            <i className='bx bxs-filter-alt'></i>            
            <p>Filters</p>
        </div>
        <div className="filter_category_content">
            {subCategories.map(category => (
            <div key={category.id} onClick={(e) => handleCategoryClick(e, category.id)} className="category_card">
                <img src={`${djangoApi}/${category.sub_category_img}`} alt="" />
                <p>{category.sub_category}</p>
            </div>
            ))}
        </div>
        </div>
    );
    }

    export default Filtercategory;
