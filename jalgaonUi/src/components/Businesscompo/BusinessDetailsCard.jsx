import React from 'react'
import './BusinessCompo.css'
import { Link } from 'react-router-dom'
function BusinessDetailsCard({businessData}) {
    const djangoApi = import.meta.env.VITE_DJANGO_API

    return (
        <div className="business_details_card">
            <div className="business_card">
                <div className="business_info">
                    <p className='business_name'>
                        <span>{businessData.business_name}</span>
                        <i class='bx bx-heart'></i>
                    </p>
                    <div className="business_rating">
                        <span>5</span>
                        <div className="rating">
                            <i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bxs-star'></i>
                        </div>
                    </div>
                    <div className="business_location">
                        <i class='bx bxs-map'></i> <p>{businessData.business_address}</p>
                    </div>
                    <div className="business_keywords">
                        <span>{businessData.sub_domain_one}</span>
                        <span>{businessData.sub_domain_two}</span>
                        <span>{businessData.sub_domain_three}</span>
                    </div>
                    <div className="business_contact">
                        <a href={`tel:${businessData.business_no}`} className='business_call_btn' target="_blank" rel="noopener noreferrer"><i class='bx bxs-phone'></i> Call Us</a>
                        <a href={`https://wa.me/+${businessData.business_no}`} target="_blank" rel="noopener noreferrer"><p><i class='bx bxl-whatsapp'></i> Whatsapp</p></a>
                        <a href={businessData.gmap_link} target="_blank" rel="noopener noreferrer"><p><i class='bx bxs-direction-right'></i> Direction</p></a>
                        <a href='' target="_blank" rel="noopener noreferrer"><p><i class='bx bx-share-alt'></i> <span>Share</span></p></a>
                    </div>
                </div>
                <div className="business_img">
                    <img src={businessData.business_banner?.startsWith('http') ? businessData.business_banner : `${djangoApi}/${businessData.business_banner}`} alt="" />
                </div>
            </div>
        </div>
    )
}

export default BusinessDetailsCard
