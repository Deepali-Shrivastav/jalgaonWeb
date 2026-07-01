import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import BreakingNewsTicker from '../components/News/BreakingNewsTicker';
import TrendingNewsSection from '../components/News/TrendingNewsSection';
import NewsCategoryFilter from '../components/News/NewsCategoryFilter';
import NewsGrid from '../components/News/NewsGrid';
import './NewsIndexPage.css';

const NewsIndexPage = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchArticles = useCallback(async (categorySlug, pageNum, append = false) => {
        setLoading(true);
        try {
            const params = { page: pageNum };
            if (categorySlug) {
                params.category = categorySlug;
            }
            const response = await axios.get(`${djangoApi}/api/v1/news/`, { params });
            
            const newArticles = response.data.results || response.data;
            
            if (append) {
                setArticles(prev => [...prev, ...newArticles]);
            } else {
                setArticles(newArticles);
            }
            
            setHasMore(!!response.data.next);
        } catch (error) {
            console.error("Error fetching articles:", error);
        } finally {
            setLoading(false);
        }
    }, [djangoApi]);

    useEffect(() => {
        // Reset to page 1 when category changes
        setPage(1);
        fetchArticles(currentCategory, 1);
    }, [currentCategory, fetchArticles]);

    const handleCategoryChange = (slug) => {
        setCurrentCategory(slug);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchArticles(currentCategory, nextPage, true);
    };

    return (
        <div className="news-index-page">
            <Navbar />
            
            <div className="news-container">
                <BreakingNewsTicker />
                
                {/* Only show trending on "All" category view */}
                {!currentCategory && <TrendingNewsSection />}
                
                <h2 className="section-title">
                    <i className='bx bx-news' style={{ color: '#dc2626', marginRight: '8px' }}></i> 
                    Latest News
                </h2>
                
                <NewsCategoryFilter 
                    currentCategory={currentCategory} 
                    onCategoryChange={handleCategoryChange} 
                />
                
                <NewsGrid articles={articles} loading={loading && page === 1} />
                
                {hasMore && (
                    <div className="load-more-container">
                        <button 
                            className="load-more-btn" 
                            onClick={handleLoadMore}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Load More News'}
                        </button>
                    </div>
                )}
            </div>
            
            <Footer />
        </div>
    );
};

export default NewsIndexPage;
