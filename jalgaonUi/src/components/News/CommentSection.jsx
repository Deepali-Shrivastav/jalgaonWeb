import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CommentSection.css';

const CommentSection = ({ articleSlug }) => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/news/${articleSlug}/comments/`);
                setComments(response.data.results || response.data);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };
        fetchComments();
    }, [articleSlug, djangoApi]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Ensure authentication token exists
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('You must be logged in to comment.');
            return;
        }

        setSubmitting(true);
        try {
            await axios.post(`${djangoApi}/api/v1/news/${articleSlug}/comments/`, 
                { body: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Your comment has been submitted and is awaiting moderation.');
            setNewComment('');
        } catch (error) {
            console.error("Error submitting comment:", error);
            setMessage('Failed to submit comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="comment-section">
            <h3 className="comments-title">Comments ({comments.length})</h3>
            
            <form onSubmit={handleSubmit} className="comment-form">
                <textarea 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Leave a comment..."
                    required
                    rows="4"
                    className="comment-textarea"
                />
                <button type="submit" disabled={submitting || !newComment.trim()} className="comment-submit-btn">
                    {submitting ? 'Submitting...' : 'Post Comment'}
                </button>
                {message && <p className="comment-message">{message}</p>}
            </form>

            <div className="comments-list">
                {comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-avatar">
                                {comment.user_name ? comment.user_name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="comment-content">
                                <div className="comment-header">
                                    <strong>{comment.user_name || 'Anonymous User'}</strong>
                                    <span className="comment-date">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="comment-body">{comment.body}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-comments">Be the first to comment!</p>
                )}
            </div>
        </div>
    );
};

export default CommentSection;
