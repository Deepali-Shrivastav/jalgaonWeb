import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import NewsCard from './NewsCard';
import './LatestNewsSection.css';

const LatestNewsSection = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [latestNews, setLatestNews] = useState([]);

    useEffect(() => {
        const fetchLatestNews = async () => {
            try {
                // Fetch just 3 recent articles for homepage
                const response = await axios.get(`${djangoApi}/api/v1/news/`);
                const results = response.data.results || response.data;
                if (Array.isArray(results)) {
                    setLatestNews(results.slice(0, 3));
                }
            } catch (error) {
                console.error("Error fetching latest news:", error);
            }
        };
        fetchLatestNews();
    }, [djangoApi]);

    if (!latestNews || latestNews.length === 0) return null;

    return (
        <div className="latest-news-home">
            <div className="latest-news-header">
                <h2 className="section-title">
                    <i className='bx bx-news' style={{ color: '#dc2626', marginRight: '8px' }}></i> 
                    Latest News
                </h2>
                <Link to="/news" className="view-all-news">View All →</Link>
            </div>
            
            <div className="latest-news-grid">
                {latestNews.map(article => (
                    <NewsCard key={article.id} article={article} />
                ))}
            </div>
        </div>
    );
};

export default LatestNewsSection;
