import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './pageUtil.css'
import BusinessDetailsCard from '../components/Businesscompo/BusinessDetailsCard'
import CompanyWork from '../components/Businesscompo/CompanyWork'
import BusinessContact from '../components/Businesscompo/BusinessContact'
import axios from 'axios'
import LoginSignup from '../components/LoginSignup/LoginSignup'


function BusinessDetailsPage() {
  const djangoApi = import.meta.env.VITE_DJANGO_API;

  const {productId} = useParams()
  const [businessData, setBusinessData] = useState([])
  // const [reviews, setReviews] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data...");
        const response = await axios.get(`${djangoApi}/api/v1/listings/detail/`, {
          params: { productId }
        });
        setBusinessData(response.data);
        console.log(response.data);
        console.log("Data fetched successfully");
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [productId]);



  return (
    <div className='main_section'>
        <div className="page_location_tow"><Link to='/'>Home</Link> &gt; Search &gt; <Link to='/categories'>{businessData.main_category}</Link> &gt; <span>{businessData.business_name}</span></div>
        <BusinessDetailsCard businessData={businessData}/>
        <div className="company_contact_details">
            <CompanyWork businessData={businessData}/>
            <BusinessContact businessData={businessData}/> 
        </div>
        <LoginSignup />
    </div>
  )
}

export default BusinessDetailsPage
