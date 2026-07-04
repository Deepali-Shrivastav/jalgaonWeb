import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BusinessCard from '../components/Categorysection/BusinessCard';

function SearchPage() {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const location = useLocation();
    const navigate = useNavigate();
    
    // Parse query parameter from URL
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get('q') || '';
    const initialCategory = queryParams.get('category') || '';

    const [query, setQuery] = useState(initialQuery);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    
    const [searchData, setSearchData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Fetch categories for filter chips
    useEffect(() => {
        axios.get(`${djangoApi}/api/v1/listings/categories/`)
            .then(res => {
                const data = res.data.results || res.data;
                setCategories(data);
            })
            .catch(err => console.error("Failed to load categories", err));
    }, [djangoApi]);

    // Perform search
    useEffect(() => {
        const fetchResults = async () => {
            if (!initialQuery && !initialCategory) {
                setSearchData([]);
                setHasSearched(false);
                return;
            }
            
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (initialQuery) params.set('q', initialQuery);
                if (initialCategory) params.set('category', initialCategory);
                
                const response = await axios.get(`${djangoApi}/api/v1/listings/search/?${params.toString()}`);
                setSearchData(response.data.results || response.data);
                setHasSearched(true);
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [initialQuery, initialCategory, djangoApi]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (selectedCategory) params.set('category', selectedCategory);
        navigate(`/searchResults?${params.toString()}`);
    };

    const handleCategoryClick = (slug) => {
        const newCategory = selectedCategory === slug ? '' : slug;
        setSelectedCategory(newCategory);
        
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (newCategory) params.set('category', newCategory);
        navigate(`/searchResults?${params.toString()}`);
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 0' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                
                {/* Search Header */}
                <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '20px' }}>Find Local Businesses</h1>
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <i className='bx bx-search' style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: '#94a3b8' }}></i>
                            <input 
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for restaurants, plumbers, doctors..."
                                style={{ width: '100%', padding: '15px 15px 15px 45px', fontSize: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                            />
                        </div>
                        <button type="submit" style={{ padding: '0 30px', background: '#0081C7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Search
                        </button>
                    </form>

                    {/* Category Filter Chips */}
                    <div style={{ marginTop: '20px' }}>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px', fontWeight: '500' }}>Popular Categories:</p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {categories.map(cat => (
                                <button 
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.slug)}
                                    style={{
                                        padding: '6px 15px', 
                                        borderRadius: '20px', 
                                        border: selectedCategory === cat.slug ? '1px solid #0081C7' : '1px solid #e2e8f0',
                                        background: selectedCategory === cat.slug ? '#e0f2fe' : '#f8fafc',
                                        color: selectedCategory === cat.slug ? '#0369a1' : '#475569',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {cat.main_category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Search Results */}
                <div>
                    {hasSearched && (
                        <h2 style={{ fontSize: '20px', color: '#334155', marginBottom: '20px' }}>
                            {searchData.length} Results found {initialQuery ? `for "${initialQuery}"` : ''}
                        </h2>
                    )}

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <div className="spinner"></div>
                            <p style={{ color: '#64748b', marginTop: '15px' }}>Searching...</p>
                        </div>
                    ) : (
                        hasSearched && searchData.length === 0 ? (
                            <div style={{ background: '#fff', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <i className='bx bx-search-alt' style={{ fontSize: '60px', color: '#cbd5e1', marginBottom: '15px' }}></i>
                                <h3 style={{ color: '#1e293b', marginBottom: '10px' }}>No results found</h3>
                                <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                                    We couldn't find any businesses matching your search criteria. Try using different keywords or checking a broader category.
                                </p>
                                <button 
                                    onClick={() => { setQuery(''); setSelectedCategory(''); navigate('/searchResults'); }} 
                                    style={{ marginTop: '20px', padding: '10px 20px', background: 'transparent', border: '1px solid #0081C7', color: '#0081C7', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Clear Search
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                {searchData.map(business => (
                                    <BusinessCard key={business.id} businessData={business} is_like={false} />
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default SearchPage;
