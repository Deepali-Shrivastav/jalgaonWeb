import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
// import './ArticleView.css';  // Make sure you create this CSS file for styling

function ArticleView() {
    const djangoApi = import.meta.env.VITE_DJANGO_API;

    const { articleId } = useParams(); 
    const [articleData, setArticleData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticleData = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/news/detail/`, { params: { articleId } });
                setArticleData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching article:', error);
                setError(error);
                setLoading(false);
            }
        };

        if (articleId) {
            fetchArticleData();
        }
    }, [articleId]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">Error: {error.message}</div>;
    }

    return (
        <div className="articleView_section">
            {articleData && (
                <div className="article_content">
                    <div className="img_short_desc">
                        <div className="article_img_content">
                            <img src={`${djangoApi}/${articleData.blog_img}`} alt={articleData.title} />
                        </div>
                        <div className="article_title">
                            <h1>{articleData.title}</h1>
                            <p>{articleData.short_desc}</p>
                        </div>
                    </div>
                    <div className="article_info">
                        <p>{articleData.para_one}</p>
                        <p>{articleData.para_two}</p>
                        <p>{articleData.para_three}</p>
                        <p>{articleData.para_four}</p>
                        <p>{articleData.para_five}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ArticleView;
