import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './BreakingNewsTicker.css';

const BreakingNewsTicker = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [breakingNews, setBreakingNews] = useState([]);
    
    useEffect(() => {
        const fetchBreakingNews = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/news/breaking/`);
                const results = response.data.results || response.data;
                if (Array.isArray(results) && results.length > 0) {
                    setBreakingNews(results);
                }
            } catch (error) {
                console.error("Error fetching breaking news:", error);
            }
        };
        fetchBreakingNews();
    }, [djangoApi]);

    if (!breakingNews || breakingNews.length === 0) return null;

    return (
        <div className="breaking-news-container">
            <div className="breaking-label">
                <span className="pulsing-dot"></span>
                BREAKING
            </div>
            <div className="breaking-ticker">
                <div className="ticker-track">
                    {breakingNews.map((news) => (
                        <div key={news.id} className="ticker-item">
                            <Link to={`/news/${news.slug}`}>{news.title}</Link>
                        </div>
                    ))}
                    {/* Duplicate for infinite scroll effect */}
                    {breakingNews.map((news) => (
                        <div key={`${news.id}-dup`} className="ticker-item">
                            <Link to={`/news/${news.slug}`}>{news.title}</Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BreakingNewsTicker;
