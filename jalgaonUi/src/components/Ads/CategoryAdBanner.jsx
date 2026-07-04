import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AdZone.css';

const CategoryAdBanner = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [ad, setAd] = useState(null);
    const [isEnabled, setIsEnabled] = useState(true);
    const trackedRef = useRef(false);

    useEffect(() => {
        const fetchCategoryAd = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/ads/by-slot/?slot=category_banner`);
                if (response.data.is_enabled && response.data.ads?.length > 0) {
                    setAd(response.data.ads[0]);
                    setIsEnabled(true);
                } else {
                    setIsEnabled(false);
                }
            } catch (error) {
                console.error("Error fetching category ad:", error);
                setIsEnabled(false);
            }
        };
        fetchCategoryAd();
    }, [djangoApi]);

    useEffect(() => {
        if (ad && !trackedRef.current) {
            trackedRef.current = true;
            axios.post(`${djangoApi}/api/v1/ads/${ad.id}/track-impression/`)
                .catch(err => console.error("Impression track failed:", err));
        }
    }, [ad, djangoApi]);

    const handleAdClick = () => {
        if (ad) {
            axios.post(`${djangoApi}/api/v1/ads/${ad.id}/track-click/`)
                .catch(err => console.error("Click track failed:", err));
        }
    };

    if (!isEnabled || !ad) return null;

    const imageSrc = ad.ad_image.startsWith('http') ? ad.ad_image : `${djangoApi}${ad.ad_image}`;

    return (
        <div className="category-ad-banner">
            <div className="category-ad-card" onClick={handleAdClick}>
                <img src={imageSrc} alt={ad.name} className="category-ad-img" />
                <div className="category-ad-content">
                    <span className="sponsored-badge">
                        <i className='bx bxs-star'></i> Sponsored Feature
                    </span>
                    <h4>{ad.name}</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                        Special promotional offer for Jalgaon residents. Contact business directly below.
                    </p>
                    <div className="category-ad-actions">
                        <a href={`tel:${ad.contact_number}`} className="category-ad-btn phone" onClick={(e) => { e.stopPropagation(); handleAdClick(); }}>
                            <i className='bx bxs-phone'></i> Call {ad.contact_number}
                        </a>
                        {ad.contact_email && (
                            <a href={`mailto:${ad.contact_email}`} className="category-ad-btn email" onClick={(e) => { e.stopPropagation(); handleAdClick(); }}>
                                <i className='bx bxs-envelope'></i> Email
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryAdBanner;
