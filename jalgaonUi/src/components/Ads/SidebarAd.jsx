import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AdZone.css';

const SidebarAd = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [ad, setAd] = useState(null);
    const [isEnabled, setIsEnabled] = useState(true);
    const trackedRef = useRef(false);

    useEffect(() => {
        const fetchSidebarAd = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/ads/by-slot/?slot=sidebar`);
                if (response.data.is_enabled && response.data.ads?.length > 0) {
                    setAd(response.data.ads[0]);
                    setIsEnabled(true);
                } else {
                    setIsEnabled(false);
                }
            } catch (error) {
                console.error("Error fetching sidebar ad:", error);
                setIsEnabled(false);
            }
        };
        fetchSidebarAd();
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
        <div className="sidebar-ad-card" onClick={handleAdClick}>
            <span className="sponsored-badge">
                <i className='bx bxs-star'></i> Sponsored Ad
            </span>
            <img src={imageSrc} alt={ad.name} className="sidebar-ad-img" />
            <h4>{ad.name}</h4>
            <div className="sidebar-ad-actions">
                <a href={`tel:${ad.contact_number}`} className="category-ad-btn phone" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); handleAdClick(); }}>
                    <i className='bx bxs-phone'></i> Call Now
                </a>
            </div>
        </div>
    );
};

export default SidebarAd;
