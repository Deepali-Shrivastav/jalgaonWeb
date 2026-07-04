import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { UserContext } from '../context/UserContext';
import { FormContext } from '../context/FormContext';
import './MyAdsPage.css';

const MyAdsPage = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const navigate = useNavigate();
    const { user, isLogin, loading: authLoading } = useContext(UserContext);
    const { setCloseForm } = useContext(FormContext);

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${djangoApi}/api/v1/ads/my-analytics/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAnalytics(response.data);
            } catch (err) {
                console.error("Error fetching ads analytics:", err);
                setError("Failed to load your ad campaigns.");
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            if (isLogin) {
                fetchAnalytics();
            } else {
                setLoading(false);
            }
        }
    }, [isLogin, authLoading, djangoApi]);

    return (
        <div className="my-ads-page">
            <Helmet>
                <title>My Advertisements & Analytics | Jalgaon.com</title>
                <meta name="description" content="Manage your advertising campaigns, view impression counters, click statistics, and performance metrics on Jalgaon.com." />
            </Helmet>

            <Navbar />

            <div className="my-ads-container">
                {/* Header */}
                <div className="my-ads-header">
                    <div>
                        <h1>Advertiser Analytics & Campaigns</h1>
                        <p>Track performance metrics, impressions, and status of your active advertisements.</p>
                    </div>
                    <Link to="/advertise/submit" className="btn-primary-lg" style={{ fontSize: '14px', padding: '10px 20px' }}>
                        + Create New Ad
                    </Link>
                </div>

                {authLoading || loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                        Loading campaign analytics...
                    </div>
                ) : !isLogin ? (
                    <div className="auth-banner-card">
                        <div className="auth-banner-icon">
                            <i className='bx bx-lock-alt'></i>
                        </div>
                        <h2>Authentication Required</h2>
                        <p>Please log in to view your ad campaigns, impression analytics, and performance metrics.</p>
                        <button className="btn-login-cta" onClick={() => setCloseForm(false)}>
                            Log In or Register
                        </button>
                    </div>
                ) : error ? (
                    <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
                        {error}
                    </div>
                ) : (
                    <>
                        {/* Analytics Metric Cards */}
                        <div className="analytics-metrics-grid">
                            <div className="metric-card">
                                <div className="metric-card-title">Total Campaigns</div>
                                <div className="metric-card-value">{analytics?.total_ads || 0}</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-card-title">Active Ads</div>
                                <div className="metric-card-value success">{analytics?.active_ads || 0}</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-card-title">Total Impressions</div>
                                <div className="metric-card-value highlight">{(analytics?.total_impressions || 0).toLocaleString()}</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-card-title">Total Clicks</div>
                                <div className="metric-card-value">{analytics?.total_clicks || 0}</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-card-title">Overall CTR</div>
                                <div className="metric-card-value highlight">{analytics?.overall_ctr || 0}%</div>
                            </div>
                        </div>

                        {/* Ads List Grid */}
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
                            Your Ad Campaigns
                        </h2>

                        {!analytics?.ads || analytics.ads.length === 0 ? (
                            <div style={{ textAlignment: 'center', padding: '50px 20px', background: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                                <h3>No Advertisements Found</h3>
                                <p style={{ marginBottom: '20px' }}>You have not submitted any ad campaigns yet.</p>
                                <Link to="/advertise/submit" className="btn-primary-lg" style={{ fontSize: '14px', padding: '10px 20px' }}>
                                    Launch First Campaign
                                </Link>
                            </div>
                        ) : (
                            <div className="user-ads-grid">
                                {analytics.ads.map(ad => {
                                    const imageSrc = ad.ad_image.startsWith('http') ? ad.ad_image : `${djangoApi}${ad.ad_image}`;
                                    return (
                                        <div key={ad.id} className="user-ad-card">
                                            <div className="user-ad-media">
                                                <img src={imageSrc} alt={ad.name} />
                                                <span className={`ad-status-badge ${ad.status}`}>
                                                    {ad.status === 'active' ? 'Active' : ad.status === 'pending' ? 'Pending' : ad.status === 'rejected' ? 'Rejected' : 'Revision Requested'}
                                                </span>
                                            </div>

                                            <div className="user-ad-content">
                                                <h3>{ad.name}</h3>
                                                
                                                <div className="ad-meta-tags">
                                                    <span className="ad-meta-tag">{ad.target_page_display || ad.target_page}</span>
                                                    <span className="ad-meta-tag">{ad.package_display || ad.package}</span>
                                                    <span className="ad-meta-tag">{ad.ad_type === 'BA' ? 'Banner Ad' : 'Carousel Ad'}</span>
                                                </div>

                                                {(ad.start_date || ad.end_date) && (
                                                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 15px 0' }}>
                                                        <i className='bx bx-calendar'></i> {ad.start_date || 'Immediate'} &rarr; {ad.end_date || 'Ongoing'}
                                                    </p>
                                                )}

                                                {/* Notice box if rejected or revision requested */}
                                                {ad.status === 'rejected' && ad.rejection_reason && (
                                                    <div className="ad-notice-box rejected">
                                                        <strong>Rejection Reason:</strong> {ad.rejection_reason}
                                                    </div>
                                                )}
                                                {ad.status === 'revision_requested' && ad.rejection_reason && (
                                                    <div className="ad-notice-box revision">
                                                        <strong>Revision Requested:</strong> {ad.rejection_reason}
                                                    </div>
                                                )}

                                                {/* Performance Stats Strip */}
                                                <div className="ad-performance-strip">
                                                    <div>
                                                        <div className="perf-item-val">{ad.impressions || 0}</div>
                                                        <div className="perf-item-lbl">Impressions</div>
                                                    </div>
                                                    <div>
                                                        <div className="perf-item-val">{ad.clicks || 0}</div>
                                                        <div className="perf-item-lbl">Clicks</div>
                                                    </div>
                                                    <div>
                                                        <div className="perf-item-val">{ad.ctr || 0}%</div>
                                                        <div className="perf-item-lbl">CTR</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default MyAdsPage;
