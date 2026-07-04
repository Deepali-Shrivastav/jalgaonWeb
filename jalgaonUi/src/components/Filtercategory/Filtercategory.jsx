import React, { useEffect, useState } from 'react';
import './Filtercategory.css';
import axios from 'axios';

function Filtercategory({ categorySlug, setFilterSubCategory, filterSubCategory }) {
  const djangoApi = import.meta.env.VITE_DJANGO_API;
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    if (categorySlug) {
      axios.get(`${djangoApi}/api/v1/listings/categories/`)
        .then(response => {
          const data = response.data.results || response.data;
          const mainCategory = data.find(c => c.slug === categorySlug);
          if (mainCategory && mainCategory.subcategories) {
            setSubCategories(mainCategory.subcategories);
          }
        })
        .catch(error => {
          console.error('Error fetching categories:', error);
        });
    }
  }, [categorySlug, djangoApi]);

  const handleCategoryClick = (e, slug) => {
    e.preventDefault();
    if (filterSubCategory === slug) {
      setFilterSubCategory(''); // Toggle off
    } else {
      setFilterSubCategory(slug);
    }
  };

  return (
    <div className="filter_category">
      <div className="filter_btn">
        <i className='bx bxs-filter-alt'></i>            
        <p>Filters</p>
      </div>
      <div className="filter_category_content">
        {subCategories.map(category => (
          <div 
            key={category.id} 
            onClick={(e) => handleCategoryClick(e, category.slug)} 
            className={`category_card ${filterSubCategory === category.slug ? 'active' : ''}`}
            style={filterSubCategory === category.slug ? { border: '2px solid #0081C7', background: '#f0f9ff' } : {}}
          >
            <img src={category.sub_category_img ? (category.sub_category_img.startsWith('http') ? category.sub_category_img : `${djangoApi}${category.sub_category_img}`) : '/placeholder_banner.jpg'} alt="" />
            <p>{category.sub_category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Filtercategory;
