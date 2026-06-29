import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Categorysection.css';
import BusinessCard from './BusinessCard';
import axios from 'axios';

function Categorysection({ businessData, mainCategory, filterSubCategory }) {
  const djangoApi = import.meta.env.VITE_DJANGO_API;
  const [ads, setAds] = useState([]);

  useEffect(() => {
    
    axios.get(`${djangoApi}/api/v1/ads/banners/`)
    .then(response => {
      console.log(response.data);
      setAds(response.data);
    })
    .catch(error => {
      console.error('Error fetching banner ads:', error);
    });
    // console.log(filterSubCategory);
  }, []);
  
  const filteredBusinessData = filterSubCategory 
    ? businessData.filter(business => business.sub_category_id === filterSubCategory)
    : businessData;

  return (
    <div className="business_section">
      <div className="business_content">
        <div className="page_location">
          <Link to=''>Home</Link> &gt; Search &gt; <span>{mainCategory}</span>
        </div> 
        <div className="result_heading">Showing Results</div>
        <div className="business_cards_ads">
          <div className="business_cards">
            {filteredBusinessData.map((business) =>
              // business.is_valid ? (
              //   <BusinessCard key={business.id} businessData={business} is_like={false} />
              // ) : null
              (
                <Link to={`/productView/${business.id}`}>
                <BusinessCard key={business.id} businessData={business} is_like={false} /></Link>
              )
            )}
          </div>
          <div className="business_ads">
            <img src={`${djangoApi}${ads.banner_add_category_one}`} alt="" />
            <img src={`${djangoApi}${ads.banner_add_category_two}`} alt="" />
            <img src={`${djangoApi}${ads.banner_add_category_three}`} alt="" />
            <img src={`${djangoApi}${ads.banner_add_category_four}`} alt="" />
          </div>
        </div>
      </div>
      <div className="category_ads"></div>
    </div>
  );
}

export default Categorysection;
