import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewsCard from './NewsCard';
import './TrendingNewsSection.css';

const TrendingNewsSection = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [trending, setTrending] = useState([]);
    
    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/news/trending/`);
                const results = response.data.results || response.data;
                if (Array.isArray(results)) {
                    setTrending(results);
                }
            } catch (error) {
                console.error("Error fetching trending news:", error);
            }
        };
        fetchTrending();
    }, [djangoApi]);

    if (!trending || trending.length === 0) return null;

    return (
        <div className="trending-section">
            <h2 className="section-title">
                <i className='bx bxs-flame' style={{ color: '#dc2626', marginRight: '8px' }}></i> 
                Trending News
            </h2>
            <div className="trending-grid">
                {/* Featured / Big Card for the top trending item */}
                <div className="trending-featured">
                    <NewsCard article={trending[0]} />
                </div>
                
                {/* Smaller cards for the rest */}
                <div className="trending-others">
                    {trending.slice(1, 4).map(article => (
                        <NewsCard key={article.id} article={article} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrendingNewsSection;
