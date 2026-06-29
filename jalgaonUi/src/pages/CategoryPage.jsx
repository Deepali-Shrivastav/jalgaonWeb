import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Filtercategory from '../components/Filtercategory/Filtercategory'
import Categorysection from '../components/Categorysection/Categorysection'
import axios from "axios"
import LoginSignup from '../components/LoginSignup/LoginSignup';
function CategoryPage() {
  const djangoApi = import.meta.env.VITE_DJANGO_API;

  const { mainCategoryId, mainCategory } = useParams();
  const [businessData, setBusinessData] = useState([]);
  const [filterSubCategory, setFilterSubCategory] = useState()

  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${djangoApi}/api/v1/listings/by-category/`, {
                params: { mainCategoryId }
            });
            setBusinessData(response.data);
            console.log("data.get");
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    if (mainCategory) {
        fetchProducts();
    }
}, []);
  return (
    <div className="main_section">
      <Filtercategory mainCategoryId={mainCategoryId} mainCategory={mainCategory} setFilterSubCategory={setFilterSubCategory}/>
      <Categorysection businessData={businessData} mainCategory={mainCategory} filterSubCategory={filterSubCategory}  />
      <LoginSignup />
    </div>
  )
}

export default CategoryPage
