import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdCheck, MdClose, MdSearch, MdStar, MdUpdate } from 'react-icons/md';

const AdminTrendingListings = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusMsg, setStatusMsg] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    
    // Form fields for trending
    const [trendingPriority, setTrendingPriority] = useState(0);
    const [trendingUntil, setTrendingUntil] = useState('');
    const [isTrending, setIsTrending] = useState(false);

    const fetchListings = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(
                `${djangoApi}/api/v1/admin-panel/listings/?search=${searchTerm}&trending=true`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setListings(response.data.results || response.data);
        } catch (error) {
            console.error("Failed to fetch trending listings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchListings();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const openTrendingModal = (listing) => {
        setSelectedListing(listing);
        setIsTrending(listing.is_trending || true);
        setTrendingPriority(listing.trending_priority || 0);
        setTrendingUntil(listing.trending_until ? new Date(listing.trending_until).toISOString().split('T')[0] : '');
        setIsModalOpen(true);
    };

    const handleSaveTrending = async (e) => {
        e.preventDefault();
        if (!selectedListing) return;

        const token = localStorage.getItem('token');
        try {
            const payload = {
                is_trending: isTrending,
                trending_priority: trendingPriority,
                trending_until: trendingUntil ? new Date(trendingUntil).toISOString() : null
            };

            await axios.patch(
                `${djangoApi}/api/v1/admin-panel/listings/${selectedListing.id}/trending/`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setStatusMsg("Trending status updated successfully.");
            fetchListings();
            setIsModalOpen(false);
            setTimeout(() => setStatusMsg(''), 3000);
        } catch (error) {
            setStatusMsg(error.response?.data?.error || `Error updating trending status`);
            setTimeout(() => setStatusMsg(''), 3000);
        }
    };

    const handleRemoveTrending = async (id) => {
        if (!window.confirm("Remove this business from trending?")) return;
        
        const token = localStorage.getItem('token');
        try {
            await axios.patch(
                `${djangoApi}/api/v1/admin-panel/listings/${id}/trending/`,
                { is_trending: false, trending_priority: 0, trending_until: null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatusMsg("Removed from trending.");
            fetchListings();
            setTimeout(() => setStatusMsg(''), 3000);
        } catch (error) {
            setStatusMsg("Error removing trending status.");
            setTimeout(() => setStatusMsg(''), 3000);
        }
    };

    return (
        <div>
            {statusMsg && (
                <div style={{ padding: '10px', background: '#dcfce7', color: '#166534', marginBottom: '15px', borderRadius: '4px' }}>
                    {statusMsg}
                </div>
            )}
            
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <div className="admin-table-search" style={{ position: 'relative' }}>
                        <MdSearch style={{ position: 'absolute', top: '10px', left: '10px', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search trending..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '35px', width: '250px' }}
                        />
                    </div>
                    <div style={{color: '#475569'}}>
                        <strong>{listings.length}</strong> Active Trending
                    </div>
                </div>
                
                <div className="admin-table-wrapper">
                    {loading ? (
                        <div className="admin-loader">Loading trending listings...</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Business Name</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Trending Until</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.length > 0 ? listings.map((l) => (
                                    <tr key={l.id}>
                                        <td>
                                            <strong>{l.business_name}</strong>
                                        </td>
                                        <td>{l.category_name}</td>
                                        <td>
                                            <span style={{background: '#fef9c3', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #fef08a', color: '#854d0e'}}>
                                                {l.trending_priority}
                                            </span>
                                        </td>
                                        <td>{l.trending_until ? new Date(l.trending_until).toLocaleDateString() : 'Indefinite'}</td>
                                        <td style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => openTrendingModal(l)} className="admin-action-btn" style={{background: '#e0f2fe', color: '#0284c7'}} title="Edit Trending">
                                                <MdUpdate /> Edit
                                            </button>
                                            <button onClick={() => handleRemoveTrending(l.id)} className="admin-action-btn reject" title="Remove Trending">
                                                <MdClose /> Remove
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center' }}>No trending listings found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Trending Edit Modal */}
            {isModalOpen && selectedListing && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Manage Trending: {selectedListing.business_name}</h3>
                        <form onSubmit={handleSaveTrending}>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Status:</label>
                                <select 
                                    value={isTrending} 
                                    onChange={(e) => setIsTrending(e.target.value === 'true')}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                >
                                    <option value={'true'}>Trending Enabled</option>
                                    <option value={'false'}>Trending Disabled</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Priority (Higher = Top):</label>
                                <input 
                                    type="number" 
                                    value={trendingPriority} 
                                    onChange={(e) => setTrendingPriority(parseInt(e.target.value) || 0)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Trending Until (Optional):</label>
                                <input 
                                    type="date" 
                                    value={trendingUntil} 
                                    onChange={(e) => setTrendingUntil(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 15px', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '8px 15px', border: 'none', background: '#0081C7', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTrendingListings;
