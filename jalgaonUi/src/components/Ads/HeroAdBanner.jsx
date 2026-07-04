import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AdZone.css';

const HeroAdBanner = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [ads, setAds] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isEnabled, setIsEnabled] = useState(true);
    const trackedImpressions = useRef(new Set());

    useEffect(() => {
        const fetchHeroAds = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/ads/by-slot/?slot=hero_banner`);
                if (response.data.is_enabled && response.data.ads?.length > 0) {
                    setAds(response.data.ads);
                    setIsEnabled(true);
                } else {
                    setIsEnabled(false);
                }
            } catch (error) {
                console.error("Error fetching hero ads:", error);
                setIsEnabled(false);
            }
        };
        fetchHeroAds();
    }, [djangoApi]);

    // Impression tracking when current slide changes
    useEffect(() => {
        if (ads.length > 0 && ads[currentSlide]) {
            const activeAd = ads[currentSlide];
            if (!trackedImpressions.current.has(activeAd.id)) {
                trackedImpressions.current.add(activeAd.id);
                axios.post(`${djangoApi}/api/v1/ads/${activeAd.id}/track-impression/`)
                    .catch(err => console.error("Impression track failed:", err));
            }
        }
    }, [currentSlide, ads, djangoApi]);

    // Auto-slide interval
    useEffect(() => {
        if (ads.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % ads.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [ads.length]);

    const handleAdClick = (adId) => {
        axios.post(`${djangoApi}/api/v1/ads/${adId}/track-click/`)
            .catch(err => console.error("Click track failed:", err));
    };

    if (!isEnabled || ads.length === 0) return null;

    const currentAd = ads[currentSlide];
    const imageSrc = currentAd.ad_image.startsWith('http') ? currentAd.ad_image : `${djangoApi}${currentAd.ad_image}`;

    return (
        <div className="hero-ad-banner">
            <div className="hero-ad-slide" onClick={() => handleAdClick(currentAd.id)}>
                <img src={imageSrc} alt={currentAd.name} className="hero-ad-image" />
                <div className="hero-ad-overlay">
                    <div className="hero-ad-info">
                        <span className="sponsored-badge">
                            <i className='bx bxs-star'></i> Sponsored
                        </span>
                        <h3>{currentAd.name}</h3>
                        <p>Contact: {currentAd.contact_number} {currentAd.contact_email ? `| ${currentAd.contact_email}` : ''}</p>
                    </div>
                    <a 
                        href={`tel:${currentAd.contact_number}`} 
                        className="hero-ad-cta" 
                        onClick={(e) => { e.stopPropagation(); handleAdClick(currentAd.id); }}
                    >
                        <i className='bx bxs-phone-call'></i> Call Now
                    </a>
                </div>
            </div>

            {ads.length > 1 && (
                <div className="hero-ad-dots">
                    {ads.map((ad, idx) => (
                        <button
                            key={ad.id}
                            className={`hero-ad-dot ${idx === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(idx)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HeroAdBanner;
