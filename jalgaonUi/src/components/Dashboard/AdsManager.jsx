import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdAdd, MdClose } from 'react-icons/md';

const AdsManager = ({ business }) => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [adType, setAdType] = useState('BA');
    const [adImage, setAdImage] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');

    const fetchAds = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${djangoApi}/api/v1/ads/my-ads/?shop_id=${business.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAds(res.data);
        } catch (error) {
            console.error('Error fetching ads', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, [business.id]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAdImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !contactNumber || !adImage) {
            setStatusMsg("Please fill required fields (Name, Contact, Image).");
            return;
        }

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('shop_listing', business.id);
        formData.append('name', name);
        formData.append('contact_number', contactNumber);
        formData.append('contact_email', contactEmail);
        formData.append('ad_type', adType);
        formData.append('ad_image', adImage);

        try {
            await axios.post(`${djangoApi}/api/v1/ads/submit/`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setStatusMsg("Advertisement submitted successfully! It is pending approval.");
            setShowForm(false);
            fetchAds();
            // Reset form
            setName(''); setContactNumber(''); setContactEmail(''); setAdImage(null);
        } catch (error) {
            console.error('Error submitting ad', error);
            setStatusMsg("Error submitting advertisement. Please try again.");
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Advertisements</h2>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    {showForm ? <MdClose /> : <MdAdd />} {showForm ? 'Cancel' : 'Create Ad'}
                </button>
            </div>

            {statusMsg && (
                <div style={{ padding: '10px', background: statusMsg.includes('Error') ? '#fee2e2' : '#dcfce7', color: statusMsg.includes('Error') ? '#b91c1c' : '#166534', marginBottom: '15px', borderRadius: '4px' }}>
                    {statusMsg}
                </div>
            )}

            {showForm && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '25px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Create New Advertisement</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Ad Title/Name *</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Contact Number *</label>
                            <input type="text" value={contactNumber} onChange={e => setContactNumber(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Contact Email</label>
                            <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Ad Type</label>
                            <select value={adType} onChange={e => setAdType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                                <option value="BA">Banner Ad</option>
                                <option value="CA">Carousel Ad</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Upload Ad Image *</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px dashed #cbd5e1', background: '#fff' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1', textAlign: 'right', marginTop: '10px' }}>
                            <button type="submit" style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Submit for Approval</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div>Loading ads...</div>
            ) : ads.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    You have not submitted any advertisements for this business yet.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {ads.map(ad => (
                        <div key={ad.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                            <img src={ad.ad_image.startsWith('http') ? ad.ad_image : `${djangoApi}${ad.ad_image}`} alt={ad.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                            <div style={{ padding: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <h4 style={{ margin: 0 }}>{ad.name}</h4>
                                    <span className={`admin-badge ${ad.status === 'active' ? 'approved' : ad.status === 'rejected' ? 'rejected' : 'pending'}`}>
                                        {ad.status === 'active' ? 'Active' : ad.status === 'rejected' ? 'Rejected' : 'Pending'}
                                    </span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '5px 0' }}>Type: {ad.ad_type === 'BA' ? 'Banner Ad' : 'Carousel Ad'}</p>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '5px 0' }}>Date: {new Date(ad.created_at).toLocaleDateString()}</p>
                                {ad.status === 'rejected' && ad.rejection_reason && (
                                    <div style={{ marginTop: '10px', padding: '8px', background: '#fee2e2', color: '#b91c1c', fontSize: '12px', borderRadius: '4px' }}>
                                        <strong>Reason:</strong> {ad.rejection_reason}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdsManager;
