import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AdZone.css';

const ListingInterstitialAd = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [ad, setAd] = useState(null);
    const [isEnabled, setIsEnabled] = useState(true);
    const trackedRef = useRef(false);

    useEffect(() => {
        const fetchInterstitialAd = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/ads/by-slot/?slot=listing_interstitial`);
                if (response.data.is_enabled && response.data.ads?.length > 0) {
                    setAd(response.data.ads[0]);
                    setIsEnabled(true);
                } else {
                    setIsEnabled(false);
                }
            } catch (error) {
                console.error("Error fetching interstitial ad:", error);
                setIsEnabled(false);
            }
        };
        fetchInterstitialAd();
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
        <div className="interstitial-ad-card" onClick={handleAdClick}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={imageSrc} alt={ad.name} className="interstitial-ad-media" />
                <div className="interstitial-ad-info">
                    <span className="sponsored-badge">
                        <i className='bx bxs-star'></i> Featured Local Sponsor
                    </span>
                    <h4>{ad.name}</h4>
                    <p>Discover products, services & exclusive deals from this local Jalgaon business.</p>
                </div>
            </div>
            <a href={`tel:${ad.contact_number}`} className="category-ad-btn phone" onClick={(e) => { e.stopPropagation(); handleAdClick(); }}>
                <i className='bx bxs-phone'></i> Contact Business
            </a>
        </div>
    );
};

export default ListingInterstitialAd;
