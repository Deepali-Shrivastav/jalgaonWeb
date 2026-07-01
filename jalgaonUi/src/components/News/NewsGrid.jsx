import React from 'react';
import NewsCard from './NewsCard';
import './NewsGrid.css';

const NewsGrid = ({ articles, loading }) => {
    if (loading) {
        return (
            <div className="news-grid-loading">
                <div className="spinner"></div>
                <p>Loading articles...</p>
            </div>
        );
    }

    if (!articles || articles.length === 0) {
        return (
            <div className="news-grid-empty">
                <p>No articles found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="news-grid">
            {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
            ))}
        </div>
    );
};

export default NewsGrid;
