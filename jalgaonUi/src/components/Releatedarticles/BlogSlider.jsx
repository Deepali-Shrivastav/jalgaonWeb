import React from 'react';
import { Link } from 'react-router-dom';
import './Releatedarticles.css';

function BlogSlider({ data, is_all }) {
  // Check if is_all is true to determine how to render
  const renderContent = is_all ? data : data.article;

  return (
<div className="article_card">
      <div className="article_img">
        <img src={renderContent.blog_img} alt={renderContent.blog_img_alt || renderContent.title} />
      </div>
      <p className="article_title">{renderContent.title}</p>
      <Link to={`/articleView/${renderContent.id}`}><p className="article_explore">Explore</p></Link>
    </div>
  );
}

export default BlogSlider;
