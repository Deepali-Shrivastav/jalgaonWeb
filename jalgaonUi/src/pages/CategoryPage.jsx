import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Filtercategory from '../components/Filtercategory/Filtercategory'
import Categorysection from '../components/Categorysection/Categorysection'
import axios from "axios"
import LoginSignup from '../components/LoginSignup/LoginSignup';
function CategoryPage() {
  const djangoApi = import.meta.env.VITE_DJANGO_API;

  const { categorySlug } = useParams();
  const [businessData, setBusinessData] = useState([]);
  const [filterSubCategory, setFilterSubCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const params = { category: categorySlug, sort: sortBy };
            if (filterSubCategory) {
                params.subcategory = filterSubCategory;
            }
            const response = await axios.get(`${djangoApi}/api/v1/listings/`, { params });
            setBusinessData(response.data.results || response.data);
            console.log("listings fetched:", response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    if (categorySlug) {
        fetchProducts();
    }
  }, [categorySlug, filterSubCategory, sortBy, djangoApi]);
  return (
    <div className="main_section">
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 20px', background: '#fff', borderBottom: '1px solid #eee' }}>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
        >
          <option value="newest">Newest First</option>
          <option value="rating">Highest Rated</option>
          <option value="trending">Trending First</option>
        </select>
      </div>
      <Filtercategory categorySlug={categorySlug} setFilterSubCategory={setFilterSubCategory} filterSubCategory={filterSubCategory} />
      <Categorysection businessData={businessData} categorySlug={categorySlug} filterSubCategory={filterSubCategory}  />
      <LoginSignup />
    </div>
  )
}

export default CategoryPage
