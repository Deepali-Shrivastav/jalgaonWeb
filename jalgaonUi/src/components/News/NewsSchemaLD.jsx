import React from 'react';
import { Helmet } from 'react-helmet';

const NewsSchemaLD = ({ article }) => {
    if (!article) return null;

    const djangoApi = import.meta.env.VITE_DJANGO_API;
    
    // Ensure image URL is absolute
    const imageUrl = article.featured_image 
        ? (article.featured_image.startsWith('http') ? article.featured_image : `${djangoApi}${article.featured_image}`)
        : '';
        
    const articleUrl = typeof window !== 'undefined' ? window.location.href : '';

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.meta_title || article.title,
        "image": imageUrl ? [imageUrl] : [],
        "datePublished": article.published_at || article.created_at,
        "dateModified": article.updated_at || article.created_at,
        "author": {
            "@type": "Person",
            "name": article.author_name || "Admin"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Jalgaon.com",
            "logo": {
                "@type": "ImageObject",
                "url": "https://jalgaon.com/logo.png" // Update with real logo URL later
            }
        },
        "description": article.meta_description || article.short_description,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": articleUrl
        }
    };

    return (
        <Helmet>
            {/* Meta Tags */}
            <title>{article.meta_title || article.title} | Jalgaon.com News</title>
            <meta name="description" content={article.meta_description || article.short_description} />
            
            {/* Open Graph Tags */}
            <meta property="og:title" content={article.meta_title || article.title} />
            <meta property="og:description" content={article.meta_description || article.short_description} />
            {imageUrl && <meta property="og:image" content={imageUrl} />}
            <meta property="og:type" content="article" />
            <meta property="og:url" content={articleUrl} />
            
            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={article.meta_title || article.title} />
            <meta name="twitter:description" content={article.meta_description || article.short_description} />
            {imageUrl && <meta name="twitter:image" content={imageUrl} />}

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
        </Helmet>
    );
};

export default NewsSchemaLD;
