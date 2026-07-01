import React from 'react';
import { Link } from 'react-router-dom';
import './NewsCard.css';

const NewsCard = ({ article }) => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const { title, slug, short_description, featured_image, category, published_at } = article;
    
    // Format date
    const date = new Date(published_at);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = published_at ? date.toLocaleDateString(undefined, options) : 'Draft';

    return (
        <div className="news-card">
            <Link to={`/news/${slug}`} className="news-card-link">
                <div className="news-card-image-wrapper">
                    {featured_image ? (
                        <img src={featured_image.startsWith('http') ? featured_image : `${djangoApi}${featured_image}`} alt={title} className="news-card-image" />
                    ) : (
                        <div className="news-card-placeholder">News Image</div>
                    )}
                    {category && (
                        <span className="news-card-category">{category.name}</span>
                    )}
                </div>
                <div className="news-card-content">
                    <h3 className="news-card-title">{title}</h3>
                    <p className="news-card-description">{short_description}</p>
                    <div className="news-card-footer">
                        <span className="news-card-date">📅 {formattedDate}</span>
                        <span className="news-card-read-more">Read More →</span>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default NewsCard;
