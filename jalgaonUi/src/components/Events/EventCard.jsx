import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event }) => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const {
        title, slug, short_description, featured_image,
        category, start_datetime, venue_name, organizer_name,
        is_featured
    } = event;

    const startDate = start_datetime ? new Date(start_datetime) : null;
    const day = startDate ? startDate.getDate() : '';
    const month = startDate ? startDate.toLocaleString('en-US', { month: 'short' }).toUpperCase() : '';
    const timeString = startDate ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    const imageUrl = featured_image
        ? (featured_image.startsWith('http') ? featured_image : `${djangoApi}${featured_image}`)
        : null;

    return (
        <div className={`event-card ${is_featured ? 'featured' : ''}`}>
            <Link to={`/events/${slug}`} className="event-card-link">
                <div className="event-card-image-wrapper">
                    {imageUrl ? (
                        <img src={imageUrl} alt={title} className="event-card-image" />
                    ) : (
                        <div className="event-card-placeholder">
                            <i className='bx bx-calendar-event' style={{ fontSize: '2.5rem', color: '#7c3aed' }}></i>
                        </div>
                    )}

                    {is_featured && (
                        <span className="event-card-featured-badge">⭐ Featured</span>
                    )}

                    {category && (
                        <span className="event-card-category">{category.name}</span>
                    )}

                    {startDate && (
                        <div className="event-card-date-badge">
                            <span className="event-date-day">{day}</span>
                            <span className="event-date-month">{month}</span>
                        </div>
                    )}
                </div>

                <div className="event-card-content">
                    <h3 className="event-card-title">{title}</h3>
                    <p className="event-card-description">{short_description}</p>

                    <div className="event-card-meta">
                        {venue_name && (
                            <span className="event-meta-item">
                                <i className='bx bx-map-pin'></i> {venue_name}
                            </span>
                        )}
                        {timeString && (
                            <span className="event-meta-item">
                                <i className='bx bx-time-five'></i> {timeString}
                            </span>
                        )}
                        {organizer_name && (
                            <span className="event-meta-item">
                                <i className='bx bx-user'></i> {organizer_name}
                            </span>
                        )}
                    </div>

                    <div className="event-card-footer">
                        <span className="event-card-cta">View Event Details →</span>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default EventCard;
