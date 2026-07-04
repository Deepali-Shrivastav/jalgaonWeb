import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { MdEdit, MdCampaign, MdWork, MdArrowBack } from 'react-icons/md';
import AdsManager from '../components/Dashboard/AdsManager';
import JobsManager from '../components/Dashboard/JobsManager';

const BusinessDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const djangoApi = import.meta.env.VITE_DJANGO_API;

    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchBusiness = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/account');
                return;
            }
            try {
                // We'll fetch the listing. We assume the backend allows the owner to view it even if pending.
                const response = await axios.get(`${djangoApi}/api/v1/listings/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBusiness(response.data);
            } catch (error) {
                console.error('Error fetching business', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBusiness();
    }, [id, navigate, djangoApi]);

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading dashboard...</div>;
    if (!business) return <div style={{ padding: '50px', textAlign: 'center' }}>Business not found or you don't have access.</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
                <Link to="/account" style={{ display: 'flex', alignItems: 'center', color: '#64748b', textDecoration: 'none' }}>
                    <MdArrowBack style={{ marginRight: '5px' }} /> Back to My Listings
                </Link>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9' }}>
                    {business.business_banner && (
                        <img 
                            src={business.business_banner.startsWith('http') ? business.business_banner : `${djangoApi}${business.business_banner}`} 
                            alt={business.business_name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>{business.business_name}</h1>
                    <p style={{ margin: 0, color: '#64748b' }}>{business.main_category_name}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span className={`admin-badge ${business.status === 'active' ? 'approved' : business.status === 'rejected' ? 'rejected' : 'pending'}`} style={{ display: 'inline-block', marginBottom: '10px' }}>
                        {business.status === 'active' ? 'Active' : business.status === 'rejected' ? 'Rejected' : 'Pending Approval'}
                    </span>
                    <div>
                        <Link to={`/business/jalgaon/${business.main_category_slug || 'uncategorized'}/${business.slug || business.id}`} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', textDecoration: 'none', color: '#475569', fontSize: '14px' }}>
                            View Public Profile
                        </Link>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '30px' }}>
                {/* Sidebar */}
                <div style={{ width: '250px', flexShrink: 0 }}>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li>
                                <button 
                                    onClick={() => setActiveTab('overview')} 
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', border: 'none', background: activeTab === 'overview' ? '#eff6ff' : 'transparent', color: activeTab === 'overview' ? '#2563eb' : '#475569', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'overview' ? 'bold' : 'normal' }}
                                >
                                    <MdEdit /> Overview
                                </button>
                            </li>
                            {business.status === 'active' && (
                                <>
                                    <li>
                                        <button 
                                            onClick={() => setActiveTab('ads')} 
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', border: 'none', background: activeTab === 'ads' ? '#eff6ff' : 'transparent', color: activeTab === 'ads' ? '#2563eb' : '#475569', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'ads' ? 'bold' : 'normal' }}
                                        >
                                            <MdCampaign /> Manage Advertisements
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => setActiveTab('jobs')} 
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', border: 'none', background: activeTab === 'jobs' ? '#eff6ff' : 'transparent', color: activeTab === 'jobs' ? '#2563eb' : '#475569', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'jobs' ? 'bold' : 'normal' }}
                                        >
                                            <MdWork /> Post Jobs
                                        </button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1 }}>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', minHeight: '400px' }}>
                        
                        {activeTab === 'overview' && (
                            <div>
                                <h2>Overview</h2>
                                {business.status !== 'active' && (
                                    <div style={{ padding: '15px', background: '#fef3c7', color: '#92400e', borderRadius: '8px', marginBottom: '20px' }}>
                                        <strong>Notice:</strong> Your business is currently {business.status}. You cannot manage advertisements or post jobs until it is approved by an administrator.
                                    </div>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{business.views || 0}</div>
                                        <div style={{ color: '#64748b' }}>Profile Views</div>
                                    </div>
                                    <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{business.avg_rating || '0.0'}</div>
                                        <div style={{ color: '#64748b' }}>Average Rating</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '30px' }}>
                                    <Link to={`/editForm/${business.id}`} style={{ display: 'inline-block', padding: '10px 20px', background: '#0f172a', color: '#fff', textDecoration: 'none', borderRadius: '6px' }}>
                                        Edit Business Profile
                                    </Link>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ads' && <AdsManager business={business} />}
                        {activeTab === 'jobs' && <JobsManager business={business} />}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessDashboard;
