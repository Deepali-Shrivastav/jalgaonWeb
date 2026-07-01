import React from 'react';
import './SocialShareBar.css';

const SocialShareBar = ({ url, title }) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle} ${encodedUrl}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`
    };

    return (
        <div className="social-share-bar">
            <span className="share-label">Share:</span>
            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="share-btn facebook">
                <i className='bx bxl-facebook'></i>
            </a>
            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="share-btn twitter">
                <i className='bx bxl-twitter'></i>
            </a>
            <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="share-btn whatsapp">
                <i className='bx bxl-whatsapp'></i>
            </a>
            <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="share-btn linkedin">
                <i className='bx bxl-linkedin'></i>
            </a>
        </div>
    );
};

export default SocialShareBar;
