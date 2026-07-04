import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import './AdvertisePage.css';

const AdvertisePage = () => {
    return (
        <div className="advertise-page">
            <Helmet>
                <title>Advertise with Us | Jalgaon.com</title>
                <meta name="description" content="Promote your business on Jalgaon.com — the #1 local city directory platform in Jalgaon, Maharashtra." />
            </Helmet>

            <Navbar />

            {/* Hero Section */}
            <section className="advertise-hero">
                <div className="advertise-hero-content">
                    <span className="advertise-badge">🚀 Local Marketing Platform</span>
                    <h1>Reach Thousands of Customers in Jalgaon City Every Day</h1>
                    <p>
                        Promote your brand, offers, and services to thousands of active local consumers searching for local businesses, news, and events.
                    </p>
                    <div className="advertise-hero-actions">
                        <Link to="/advertise/submit" className="btn-primary-lg">
                            Submit Ad Request
                        </Link>
                        <Link to="/advertise/ads" className="btn-outline-lg">
                            Browse Active Ads
                        </Link>
                    </div>
                </div>
            </section>

            <div className="advertise-container">
                {/* Stats */}
                <div className="advertise-stats">
                    <div className="stat-card">
                        <div className="stat-number">50,000+</div>
                        <div className="stat-label">Monthly Visitors</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">5,000+</div>
                        <div className="stat-label">Local Businesses</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">95%</div>
                        <div className="stat-label">Local Jalgaon Audience</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">100%</div>
                        <div className="stat-label">Verified Performance</div>
                    </div>
                </div>

                {/* Packages Section */}
                <section className="packages-section">
                    <div className="section-header">
                        <h2>Flexible Advertising Packages</h2>
                        <p>Choose a plan that fits your marketing budget and promotional goals.</p>
                    </div>

                    <div className="packages-grid">
                        {/* Basic Package */}
                        <div className="package-card">
                            <h3 className="package-name">Basic Package</h3>
                            <div className="package-price">₹499 <span>/ 3 Days</span></div>
                            <ul className="package-features">
                                <li><i className='bx bx-check-circle'></i> Standard Banner Placement</li>
                                <li><i className='bx bx-check-circle'></i> Target Sidebar or Category Page</li>
                                <li><i className='bx bx-check-circle'></i> Click & Impression Counter</li>
                                <li><i className='bx bx-check-circle'></i> Basic Support</li>
                            </ul>
                            <Link to="/advertise/submit?package=basic" className="btn-package">
                                Select Basic
                            </Link>
                        </div>

                        {/* Standard Package */}
                        <div className="package-card popular">
                            <div className="popular-tag">Most Popular</div>
                            <h3 className="package-name">Standard Package</h3>
                            <div className="package-price">₹999 <span>/ 7 Days</span></div>
                            <ul className="package-features">
                                <li><i className='bx bx-check-circle'></i> Priority Placement (Hero Carousel / Banners)</li>
                                <li><i className='bx bx-check-circle'></i> Category & Homepage Visibility</li>
                                <li><i className='bx bx-check-circle'></i> Direct Phone / Email CTA</li>
                                <li><i className='bx bx-check-circle'></i> Real-time Click & Impression Tracking</li>
                                <li><i className='bx bx-check-circle'></i> Expedited Admin Approval</li>
                            </ul>
                            <Link to="/advertise/submit?package=standard" className="btn-package">
                                Select Standard
                            </Link>
                        </div>

                        {/* Premium Package */}
                        <div className="package-card">
                            <h3 className="package-name">Premium Package</h3>
                            <div className="package-price">₹2,499 <span>/ 30 Days</span></div>
                            <ul className="package-features">
                                <li><i className='bx bx-check-circle'></i> Top Homepage Hero Banner Slot</li>
                                <li><i className='bx bx-check-circle'></i> Featured Across All Placement Zones</li>
                                <li><i className='bx bx-check-circle'></i> Comprehensive Analytics & CTR Insights</li>
                                <li><i className='bx bx-check-circle'></i> VIP Support & Custom Media Design</li>
                            </ul>
                            <Link to="/advertise/submit?package=premium" className="btn-package">
                                Select Premium
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Placement Zones Section */}
                <section className="placements-section">
                    <div className="section-header">
                        <h2>Available Placement Zones</h2>
                        <p>Maximize engagement by placing your advertisement where customer intent is highest.</p>
                    </div>

                    <div className="placements-grid">
                        <div className="placement-card">
                            <div className="placement-icon">
                                <i className='bx bx-carousel'></i>
                            </div>
                            <h3>Homepage Hero Banner</h3>
                            <p>Prime banner location at the top of the homepage for maximum city-wide brand awareness.</p>
                        </div>

                        <div className="placement-card">
                            <div className="placement-icon">
                                <i className='bx bx-grid-alt'></i>
                            </div>
                            <h3>Category Page Banner</h3>
                            <p>Target shoppers browsing specific categories (e.g. Hospitals, Electronics, Restaurants).</p>
                        </div>

                        <div className="placement-card">
                            <div className="placement-icon">
                                <i className='bx bx-layout'></i>
                            </div>
                            <h3>Sidebar Cards</h3>
                            <p>Persistent sidebar placement on high-traffic search results and business details pages.</p>
                        </div>

                        <div className="placement-card">
                            <div className="placement-icon">
                                <i className='bx bx-list-check'></i>
                            </div>
                            <h3>Between Listings</h3>
                            <p>Native interstitial banner appearing seamlessly inside organic directory search listings.</p>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default AdvertisePage;
