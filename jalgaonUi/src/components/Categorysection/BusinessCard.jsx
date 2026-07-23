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
        <div className="business_card_wrapper" style={{ position: 'relative' }}>
            {businessData.is_trending && (
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'gold', color: '#000', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', zIndex: 10 }}>
                    <i className='bx bxs-star'></i> Featured
                </div>
            )}
            <Link to={`/business/jalgaon/${businessData.main_category_slug || 'uncategorized'}/${businessData.slug || businessData.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="business_card">
                <div className="business_imgg">
                    <img src={businessData.business_banner?.startsWith('http') ? businessData.business_banner : (businessData.business_banner ? `${img_url}${businessData.business_banner}` : '/placeholder_banner.jpg')} alt={businessData.business_banner_alt || businessData.business_name} />
                </div>
                <div className="business_info">
                    <p className='business_name'>
                        <span>{businessData.business_name}</span>
                        {!is_edit && (
                            <i onClick={(e) => { e.preventDefault(); addLikedShop(user?.id, businessData.id); }} className='bx bx-heart'></i>
                        )}
                    </p>
                    <div className="business_rating">
                        <span>{businessData.avg_rating || '5.0'}</span>
                        <div className="rating" style={{ color: '#FFD700' }}>
                            <i className='bx bxs-star'></i>
                            <span style={{ color: '#64748b', marginLeft: '5px', fontSize: '14px' }}>({businessData.review_count || 0} Reviews)</span>
                        </div>
                    </div>
                    <div className="business_location">
                        <i className='bx bxs-map'></i> <p>{businessData.business_address}</p>
                    </div>
                    <div className="business_keywords">
                        {businessData.main_category && <span>{businessData.main_category}</span>}
                        {businessData.sub_category && <span>{businessData.sub_category}</span>}
                    </div>
                    <div className="business_contact">
                        {is_edit ? (
                            <Link to={`/business-dashboard/${businessData.slug}`} className='business_call_btn' onClick={e => e.stopPropagation()} style={{ background: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <i className='bx bxs-dashboard'></i> Dashboard
                            </Link>
                        ) : (
                            <a href={`tel:${businessData.business_no}`} className='business_call_btn' onClick={e => e.stopPropagation()}><i className='bx bxs-phone'></i> Call Us</a>
                        )}
                        <Link to={`/business/jalgaon/${businessData.main_category_slug || 'uncategorized'}/${businessData.slug || businessData.id}`}><p>View Details</p></Link>
                    </div>
                </div>
            </div>
            </Link>
        </div>
    );
}

export default BusinessCard;
