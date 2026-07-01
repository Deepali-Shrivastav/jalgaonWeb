import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import CommentSection from '../components/News/CommentSection';
import SocialShareBar from '../components/News/SocialShareBar';
import NewsSchemaLD from '../components/News/NewsSchemaLD';
import './NewsArticlePage.css';

const NewsArticlePage = () => {
    const { slug } = useParams();
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/news/${slug}/`);
                setArticle(response.data);
            } catch (err) {
                console.error("Error fetching article:", err);
                setError("Article not found or failed to load.");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchArticle();
        }
    }, [slug, djangoApi]);

    if (loading) {
        return (
            <div className="article-page-wrapper">
                <Navbar />
                <div className="article-loading">
                    <div className="spinner"></div>
                    <p>Loading article...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="article-page-wrapper">
                <Navbar />
                <div className="article-error">
                    <h2>Oops!</h2>
                    <p>{error || "Article not found."}</p>
                </div>
                <Footer />
            </div>
        );
    }

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    
    // Format text with paragraph breaks
    const formattedContent = article.content ? article.content.split('\n\n').map((para, index) => (
        <p key={index}>{para}</p>
    )) : null;

    return (
        <div className="article-page-wrapper">
            <NewsSchemaLD article={article} />
            <Navbar />
            
            <main className="article-main-content">
                <article className="news-article">
                    <header className="article-header">
                        {article.category && (
                            <span className="article-category-pill">{article.category.name}</span>
                        )}
                        <h1 className="article-title">{article.title}</h1>
                        <p className="article-short-desc">{article.short_description}</p>
                        
                        <div className="article-meta">
                            <div className="author-info">
                                <div className="author-avatar">
                                    {article.author_name ? article.author_name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div className="author-details">
                                    <span className="author-name">By {article.author_name || 'Admin'}</span>
                                    <span className="publish-date">
                                        {article.published_at 
                                            ? new Date(article.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                                            : 'Draft'
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="article-stats">
                                <span className="view-count"><i className='bx bx-show'></i> {article.view_count} views</span>
                            </div>
                        </div>
                        
                        <SocialShareBar url={currentUrl} title={article.title} />
                    </header>
                    
                    {article.featured_image && (
                        <div className="article-hero-image">
                            <img 
                                src={article.featured_image.startsWith('http') ? article.featured_image : `${djangoApi}${article.featured_image}`} 
                                alt={article.title} 
                            />
                        </div>
                    )}
                    
                    <div className="article-body">
                        {formattedContent}
                    </div>
                    
                    {article.tags && article.tags.length > 0 && (
                        <div className="article-tags">
                            <h4>Tags:</h4>
                            <div className="tags-list">
                                {article.tags.map(tag => (
                                    <span key={tag.id} className="tag-pill">#{tag.name}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
                
                <CommentSection articleSlug={slug} />
            </main>
            
            <Footer />
        </div>
    );
};

export default NewsArticlePage;
