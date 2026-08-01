import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdsIndexPage.css';
import { Helmet } from 'react-helmet';

const AdsIndexPage = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/ads/list/`);
                setAds(response.data);
            } catch (error) {
                console.error('Error fetching ads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
    }, [djangoApi]);

    return (
        <div className="ads-index-container">
            <Helmet>
                <title>Advertisements | Jalgaon.com</title>
                <meta name="description" content="Check out the latest business advertisements and offers in Jalgaon." />
            </Helmet>
            
            <div className="ads-header">
                <h1>Featured Advertisements</h1>
                <p>Discover the latest offers and businesses from Jalgaon.</p>
            </div>

            {loading ? (
                <div className="loading-state">Loading advertisements...</div>
            ) : ads.length === 0 ? (
                <div className="empty-state">
                    <h3>No Active Advertisements Found</h3>
                    <p>There are currently no active advertisements to display.</p>
                </div>
            ) : (
                <div className="ads-grid">
                    {ads.map((ad) => (
                        <div key={ad.id} className="ad-card">
                            <div className="ad-image-wrapper">
                                <img src={ad.ad_image.startsWith('http') ? ad.ad_image : `${djangoApi}${ad.ad_image}`} 
                                    alt={ad.ad_image_alt || ad.name} 
                                    className="ad-image"
                                />
                            </div>
                            <div className="ad-content">
                                <h3>{ad.name}</h3>
                                <p className="ad-type">{ad.ad_type === 'BA' ? 'Banner Advertisement' : 'Carousel Advertisement'}</p>
                                <div className="ad-contact">
                                    <a href={`tel:${ad.contact_number}`} className="contact-btn phone">
                                        <i className='bx bxs-phone'></i> Call Now
                                    </a>
                                    {ad.contact_email && (
                                        <a href={`mailto:${ad.contact_email}`} className="contact-btn email">
                                            <i className='bx bxs-envelope'></i> Email
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdsIndexPage;
