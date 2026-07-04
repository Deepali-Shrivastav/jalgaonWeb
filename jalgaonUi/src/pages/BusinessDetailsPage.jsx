import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import './BusinessDetailsPage.css';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import BusinessCard from '../components/Categorysection/BusinessCard';
import BusinessClaimModal from '../components/BusinessClaimModal/BusinessClaimModal';
import BusinessReportModal from '../components/BusinessReportModal/BusinessReportModal';
import { UserContext } from '../context/UserContext';

function BusinessDetailsPage() {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const { productId } = useParams(); // URL params
    const { user } = useContext(UserContext);
    
    const [businessData, setBusinessData] = useState(null);
    const [relatedListings, setRelatedListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    
    // Review form state
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch main listing
                const response = await axios.get(`${djangoApi}/api/v1/listings/${productId}/`);
                const data = response.data;
                setBusinessData(data);
                
                // Fetch related listings
                if (data.main_category_slug) {
                    const relatedRes = await axios.get(`${djangoApi}/api/v1/listings/`, {
                        params: { category: data.main_category_slug }
                    });
                    const results = relatedRes.data.results || relatedRes.data;
                    setRelatedListings(results.filter(item => item.slug !== data.slug && item.id.toString() !== productId).slice(0, 4));
                }
                
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        };
        fetchData();
    }, [productId, djangoApi]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to submit a review');
            return;
        }
        try {
            await axios.post(`${djangoApi}/api/v1/listings/${businessData.slug}/reviews/create/`, {
                rating: reviewRating,
                review_text: reviewText
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Review submitted successfully! It is pending moderation.');
            setReviewText('');
            setReviewRating(5);
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review.');
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${businessData.business_name} | Jalgaon.com`,
                    text: `Check out ${businessData.business_name} on Jalgaon.com!`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return <div style={{margin: '150px auto', textAlign: 'center'}}><h2>Loading Business...</h2></div>;
    }

    if (!businessData) {
        return <div style={{margin: '150px auto', textAlign: 'center'}}><h2>Business not found</h2></div>;
    }

    const bannerSrc = businessData.business_banner?.startsWith('http') 
        ? businessData.business_banner 
        : `${djangoApi}${businessData.business_banner}`;

    // Parse business hours if JSON
    let businessHours = null;
    if (businessData.business_hours) {
        try {
            businessHours = typeof businessData.business_hours === 'string' 
                ? JSON.parse(businessData.business_hours) 
                : businessData.business_hours;
        } catch (e) {
            console.error('Error parsing business hours');
        }
    }

    return (
        <div className='business_profile_container'>
            <Helmet>
                <title>{businessData.business_name} | Jalgaon.com</title>
                <meta name="description" content={businessData.business_description?.substring(0, 160)} />
                <script type="application/ld+json">
                    {`
                        {
                            "@context": "https://schema.org",
                            "@type": "LocalBusiness",
                            "name": "${businessData.business_name}",
                            "image": "${bannerSrc}",
                            "url": "${window.location.href}",
                            "telephone": "${businessData.business_no || ''}",
                            "address": {
                                "@type": "PostalAddress",
                                "streetAddress": "${businessData.business_address?.replace(/\n/g, ' ') || ''}",
                                "addressLocality": "${businessData.city || 'Jalgaon'}",
                                "addressRegion": "MH",
                                "addressCountry": "IN"
                            }
                        }
                    `}
                </script>
            </Helmet>

            {/* Breadcrumbs */}
            <div style={{marginBottom: '20px', color: '#6b7280', fontSize: '14px'}}>
                <Link to='/' style={{color: '#0081C7', textDecoration: 'none'}}>Home</Link> &gt; 
                <Link to={`/categories/${businessData.main_category_slug}`} style={{color: '#0081C7', textDecoration: 'none', margin: '0 5px'}}>
                    {businessData.main_category_name}
                </Link> &gt; 
                <span style={{color: '#111827', marginLeft: '5px', fontWeight: '500'}}>{businessData.business_name}</span>
            </div>

            {/* Hero Section */}
            <div className="business_hero">
                <img src={bannerSrc} alt={businessData.business_name} className="hero_banner_img" onError={(e) => { e.target.src = '/placeholder_banner.jpg' }} />
                <div className="hero_overlay">
                    <h1>{businessData.business_name}</h1>
                    <div className="hero_meta">
                        <span className="rating_badge">
                            <i className='bx bxs-star'></i> {businessData.avg_rating || 'New'} 
                            <span style={{fontSize: '12px', fontWeight: 'normal'}}>({businessData.review_count} reviews)</span>
                        </span>
                        <span className="category_badge">{businessData.main_category_name}</span>
                        {businessData.city && <span><i className='bx bxs-map'></i> {businessData.city}</span>}
                    </div>
                </div>
            </div>

            <div className="business_content_grid">
                {/* Main Content */}
                <div className="main_content_section">
                    <h3 className="section_title">About {businessData.business_name}</h3>
                    <div className="business_desc_text">
                        {businessData.business_description ? (
                            <p>{businessData.business_description}</p>
                        ) : (
                            <p>No description provided yet.</p>
                        )}
                        {businessData.business_dob && businessData.business_dob !== 'N/A' && (
                            <p style={{marginTop: '10px', color: '#64748b'}}><strong>Established:</strong> {businessData.business_dob}</p>
                        )}
                        
                        {/* Tags (Migrated from sub_domains) */}
                        <div style={{marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                            {[businessData.sub_domain_one, businessData.sub_domain_two, businessData.sub_domain_three, businessData.sub_domain_four, businessData.sub_domain_five]
                                .filter(Boolean).map((tag, idx) => (
                                <span key={idx} style={{background: '#f1f5f9', padding: '5px 12px', borderRadius: '16px', fontSize: '13px', color: '#475569'}}>{tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* Business Hours */}
                    {businessHours && Object.keys(businessHours).length > 0 && (
                        <div style={{marginTop: '30px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px'}}>
                            <h3 className="section_title" style={{marginBottom: '15px'}}><i className='bx bx-time-five'></i> Business Hours</h3>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                    businessHours[day] && (
                                        <div key={day} style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px'}}>
                                            <span style={{textTransform: 'capitalize', fontWeight: '500', color: '#475569'}}>{day}</span>
                                            <span style={{color: '#0f172a'}}>
                                                {businessHours[day].closed ? 'Closed' : `${businessHours[day].open || ''} - ${businessHours[day].close || ''}`}
                                            </span>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gallery Section */}
                    {businessData.gallery_photos && businessData.gallery_photos.length > 0 && (
                        <div style={{marginTop: '40px'}}>
                            <h3 className="section_title">Gallery</h3>
                            <div className="gallery_grid">
                                {businessData.gallery_photos.map((photo, index) => (
                                    <img key={index} src={photo.image.startsWith('http') ? photo.image : `${djangoApi}${photo.image}`} alt={`Gallery ${index}`} className="gallery_img" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews Section */}
                    <div className="reviews_section">
                        <h3 className="section_title">Customer Reviews</h3>
                        
                        {/* Write a Review Form */}
                        <div className="write_review_box" style={{background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '30px'}}>
                            <h4 style={{marginBottom: '15px'}}>Write a Review</h4>
                            <form onSubmit={handleReviewSubmit}>
                                <div style={{marginBottom: '10px'}}>
                                    <label style={{display: 'block', marginBottom: '5px'}}>Rating:</label>
                                    <select value={reviewRating} onChange={(e) => setReviewRating(e.target.value)} style={{padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none'}}>
                                        <option value={5}>5 - Excellent</option>
                                        <option value={4}>4 - Good</option>
                                        <option value={3}>3 - Average</option>
                                        <option value={2}>2 - Poor</option>
                                        <option value={1}>1 - Terrible</option>
                                    </select>
                                </div>
                                <div style={{marginBottom: '15px'}}>
                                    <label style={{display: 'block', marginBottom: '5px'}}>Review Text:</label>
                                    <textarea 
                                        value={reviewText} 
                                        onChange={(e) => setReviewText(e.target.value)} 
                                        required 
                                        rows="4" 
                                        style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'inherit'}}
                                        placeholder="Share your experience..."
                                    ></textarea>
                                </div>
                                <button type="submit" className="action_btn btn_primary" style={{cursor: 'pointer', padding: '10px 20px', border: 'none', color: '#fff', background: '#0081C7', borderRadius: '6px', fontWeight: 'bold'}}>
                                    Submit Review
                                </button>
                            </form>
                        </div>

                        {/* List Reviews */}
                        {businessData.reviews && businessData.reviews.length > 0 ? (
                            businessData.reviews.map((review, idx) => (
                                <div key={idx} className="review_card">
                                    <div className="review_header">
                                        <span className="reviewer_name">{review.user_name || 'Verified User'}</span>
                                        <span className="review_stars">
                                            {Array(review.rating).fill().map((_, i) => <i key={i} className='bx bxs-star'></i>)}
                                            {Array(5 - review.rating).fill().map((_, i) => <i key={i} className='bx bx-star'></i>)}
                                        </span>
                                    </div>
                                    <p style={{color: '#4b5563', margin: '5px 0'}}>{review.review_text}</p>
                                    <span className="review_date">{new Date(review.timestamp).toLocaleDateString()}</span>
                                </div>
                            ))
                        ) : (
                            <p style={{color: '#64748b'}}>No reviews yet. Be the first to review!</p>
                        )}
                        
                        {/* Claim Business Section */}
                        {!businessData.is_claimed && (
                            <div className="claim_business_banner" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#0f172a' }}><i className='bx bx-store-alt'></i> Own this business?</h4>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Claim it to manage your listing, update information, and respond to reviews.</p>
                                </div>
                                <button onClick={() => setIsClaimModalOpen(true)} style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap', marginLeft: '15px' }}>
                                    Claim Now
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Related Listings Section */}
                    {relatedListings && relatedListings.length > 0 && (
                        <div style={{marginTop: '40px'}}>
                            <h3 className="section_title">Related Businesses</h3>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px'}}>
                                {relatedListings.map(business => (
                                    <BusinessCard key={business.id} businessData={business} is_like={false} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="sidebar_section">
                    
                    <h3 className="section_title">Contact Info</h3>
                    
                    {businessData.business_address && (
                        <div className="contact_item">
                            <i className='bx bx-map-pin'></i>
                            <div>
                                <h4>Address</h4>
                                <p>{businessData.business_address}</p>
                            </div>
                        </div>
                    )}

                    {businessData.business_no && (
                        <div className="contact_item">
                            <i className='bx bx-phone'></i>
                            <div>
                                <h4>Phone</h4>
                                <p>{businessData.business_no}</p>
                            </div>
                        </div>
                    )}

                    {businessData.business_email && (
                        <div className="contact_item">
                            <i className='bx bx-envelope'></i>
                            <div>
                                <h4>Email</h4>
                                <p>{businessData.business_email}</p>
                            </div>
                        </div>
                    )}

                    <div className="action_buttons" style={{position: 'sticky', top: '20px'}}>
                        {businessData.business_no && (
                            <a href={`tel:${businessData.business_no}`} className="action_btn btn_primary">
                                <i className='bx bxs-phone-call'></i> Call Now
                            </a>
                        )}
                        {businessData.whatsapp && (
                            <a href={`https://wa.me/91${businessData.whatsapp}`} target="_blank" rel="noopener noreferrer" className="action_btn btn_whatsapp">
                                <i className='bx bxl-whatsapp'></i> WhatsApp
                            </a>
                        )}
                        {businessData.gmap_link && (
                            <a href={businessData.gmap_link} target="_blank" rel="noopener noreferrer" className="action_btn" style={{background: '#f3f4f6', color: '#111'}}>
                                <i className='bx bx-directions'></i> Get Directions
                            </a>
                        )}
                        <button onClick={handleShare} className="action_btn" style={{background: '#e2e8f0', color: '#1e293b', border: 'none', cursor: 'pointer'}}>
                            <i className='bx bx-share-alt'></i> Share
                        </button>
                        <button onClick={() => setIsReportModalOpen(true)} className="action_btn" style={{background: '#fef2f2', color: '#dc2626', border: 'none', cursor: 'pointer'}}>
                            <i className='bx bx-flag'></i> Report
                        </button>
                    </div>

                    {/* Social Links Block */}
                    {(businessData.website_link || businessData.insta_link || businessData.facebook_link) && (
                        <div style={{marginTop: '30px'}}>
                            <h4 style={{marginBottom: '15px', color: '#374151'}}>Connect with us</h4>
                            <div style={{display: 'flex', gap: '15px'}}>
                                {businessData.website_link && (
                                    <a href={businessData.website_link} target="_blank" rel="noopener noreferrer" style={{fontSize: '24px', color: '#4b5563'}}>
                                        <i className='bx bx-globe'></i>
                                    </a>
                                )}
                                {businessData.insta_link && (
                                    <a href={businessData.insta_link} target="_blank" rel="noopener noreferrer" style={{fontSize: '24px', color: '#E1306C'}}>
                                        <i className='bx bxl-instagram'></i>
                                    </a>
                                )}
                                {businessData.facebook_link && (
                                    <a href={businessData.facebook_link} target="_blank" rel="noopener noreferrer" style={{fontSize: '24px', color: '#1877F2'}}>
                                        <i className='bx bxl-facebook-square'></i>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <BusinessClaimModal 
                isOpen={isClaimModalOpen} 
                onClose={() => setIsClaimModalOpen(false)} 
                business={businessData}
                djangoApi={djangoApi}
            />

            <BusinessReportModal 
                isOpen={isReportModalOpen} 
                onClose={() => setIsReportModalOpen(false)} 
                business={businessData}
                djangoApi={djangoApi}
            />
        </div>
    );
}

export default BusinessDetailsPage;
