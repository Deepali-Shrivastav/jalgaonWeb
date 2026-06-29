import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Category.css'
import Category from './Category'
import axios from 'axios';



function Categorytile() {
  const djangoApi = import.meta.env.VITE_DJANGO_API

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    axios.get(`${djangoApi}/api/v1/listings/categories/`)
        .then(response => {
            setCategories(response.data.categories);
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
        });
  }, []);
  return (
    <div className="categoryes_tiles">

        {categories.map(category=>(
          <Link to={`/categories/${category.id}/${category.main_category}`}>
            <Category name={category.main_category} />          
          </Link>
        ))}

        {/* <Category name="Real State" />
        <Category name="Legal Services" />
        <Category name="Education" />
        <Category name="Education" />
        <Category name="Health & Wellness" />
        <Category name="Financial Services" />
        <Category name="Home & Garden" /> */}
    </div>
  )
}

export default Categorytile
