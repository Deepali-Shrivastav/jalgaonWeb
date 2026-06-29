import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';

function BusinessCard({ businessData, is_like, is_edit=false }) {
    console.log(businessData);
    const djangoApi = import.meta.env.VITE_DJANGO_API
    const { user } = useContext(UserContext);
    const img_url = is_like ? `${djangoApi}` : `${djangoApi}/media/`;
    // const img_url = is_like ? "http://127.0.0.1:8000/" : "http://127.0.0.1:8000/media/";
    const token = localStorage.getItem('token');
    console.log(businessData.id);
    const addLikedShop = async (userId, shopListingId) => {
        if (!token) {
            console.error('No token found in localStorage');
            return;
        }

        try {
            const response = await axios.post(
                // 'http://127.0.0.1:8000/api/v1/listings/favorites/',
                `${djangoApi}/api/v1/listings/favorites/`,
            {
                user: userId,               // Ensure this matches the expected field name
                shop_listing: shopListingId // Ensure this matches the expected field name
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            console.log("Data is stored");
            alert("Added to liked");
            return response.data;
        } catch (error) {
            console.error('Error adding liked shop:', error.response ? error.response.data : error.message);
            throw error;
        }
    };

    return (
        <Link to={`/productView/${businessData.id}`}>
        <div className="business_card">
            <div className="business_imgg">
                <img src={`${img_url}${businessData.business_banner}`} alt="" />
            </div>
            <div className="business_info">
                <p className='business_name'>
                    <span>{businessData.business_name}</span>
                    {is_edit ? (
                        <Link to={`/editForm/${businessData.id}`}>
                            <i onClick={() => addLikedShop(user.id, businessData.id)} className='bx bxs-edit'></i>
                        </Link>

                    ) : (
                        <i onClick={() => addLikedShop(user.id, businessData.id)} className='bx bx-heart'></i>
                    )}
                </p>
                <div className="business_rating">
                    <span>5</span>
                    <div className="rating">
                        <i className='bx bxs-star'></i><i className='bx bxs-star'></i><i className='bx bxs-star'></i><i className='bx bxs-star'></i><i className='bx bxs-star'></i>
                    </div>
                </div>
                <div className="business_location">
                    <i className='bx bxs-map'></i> <p>{businessData.business_address}</p>
                </div>
                <div className="business_keywords">
                    <span>{businessData.sub_domain_one}</span>
                    <span>{businessData.sub_domain_two}</span>
                    <span>{businessData.sub_domain_three}</span>
                </div>
                <div className="business_contact">
                    <a href={`tel:${businessData.business_no}`} className='business_call_btn'><i className='bx bxs-phone'></i> Call Us</a>
                    <Link to={`/productView/${businessData.id}`}><p>View Details</p></Link>
                    <Link to='/'><p><i className='bx bx-share-alt'></i> <span>Share</span></p></Link>
                </div>
            </div>
        </div>
        </Link>
        
    );
}

export default BusinessCard;
