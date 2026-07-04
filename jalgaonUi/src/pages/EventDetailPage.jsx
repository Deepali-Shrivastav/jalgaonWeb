import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import SocialShareBar from '../components/News/SocialShareBar';
import EventSchemaLD from '../components/Events/EventSchemaLD';
import './EventDetailPage.css';

const EventDetailPage = () => {
    const { slug } = useParams();
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/events/${slug}/`);
                setEvent(response.data);
            } catch (err) {
                console.error("Error fetching event details:", err);
                setError("Event not found or has passed.");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchEvent();
        }
    }, [slug, djangoApi]);

    if (loading) {
        return (
            <div className="event-detail-page-wrapper">
                <Navbar />
                <div className="event-loading">
                    <div className="spinner"></div>
                    <p>Loading event details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="event-detail-page-wrapper">
                <Navbar />
                <div className="event-error">
                    <h2>Event Not Found</h2>
                    <p>{error || "The requested event could not be found."}</p>
                    <Link to="/events" className="back-btn">← Back to Events</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const startDate = event.start_datetime ? new Date(event.start_datetime) : null;
    const endDate = event.end_datetime ? new Date(event.end_datetime) : null;

    const formattedStartDate = startDate ? startDate.toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }) : '';
    const formattedStartTime = startDate ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    const formattedEndTime = endDate ? endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    const formattedContent = event.description ? event.description.split('\n\n').map((para, index) => (
        <p key={index}>{para}</p>
    )) : null;

    const imageUrl = event.featured_image
        ? (event.featured_image.startsWith('http') ? event.featured_image : `${djangoApi}${event.featured_image}`)
        : null;

    return (
        <div className="event-detail-page-wrapper">
            <EventSchemaLD event={event} />
            <Navbar />

            <main className="event-detail-main">
                <div className="event-breadcrumb">
                    <Link to="/events">Events</Link> &gt; <span>{event.title}</span>
                </div>

                <article className="event-article">
                    <header className="event-header">
                        <div className="event-header-badges">
                            {event.category && (
                                <span className="event-category-badge">{event.category.name}</span>
                            )}
                            {event.is_featured && (
                                <span className="event-featured-badge">⭐ Featured Event</span>
                            )}
                        </div>

                        <h1 className="event-title">{event.title}</h1>
                        <p className="event-short-desc">{event.short_description}</p>

                        {/* Event Details Quick Bar */}
                        <div className="event-info-grid">
                            <div className="info-card">
                                <div className="info-icon"><i className='bx bx-calendar'></i></div>
                                <div className="info-text">
                                    <span className="info-label">Date & Time</span>
                                    <span className="info-value">{formattedStartDate}</span>
                                    <span className="info-subvalue">
                                        {formattedStartTime} {formattedEndTime && `– ${formattedEndTime}`}
                                    </span>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon"><i className='bx bx-map-pin'></i></div>
                                <div className="info-text">
                                    <span className="info-label">Venue</span>
                                    <span className="info-value">{event.venue_name}</span>
                                    <span className="info-subvalue">{event.venue_address}</span>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon"><i className='bx bx-user'></i></div>
                                <div className="info-text">
                                    <span className="info-label">Organizer</span>
                                    <span className="info-value">{event.organizer_name}</span>
                                    {event.organizer_contact && <span className="info-subvalue">{event.organizer_contact}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="event-header-meta">
                            <SocialShareBar url={currentUrl} title={event.title} />
                            {event.view_count > 0 && (
                                <span className="event-view-count"><i className='bx bx-show'></i> {event.view_count} views</span>
                            )}
                        </div>
                    </header>

                    {/* Featured Image */}
                    {imageUrl && (
                        <div className="event-hero-image">
                            <img src={imageUrl} alt={event.title} />
                        </div>
                    )}

                    {/* Registration CTA */}
                    {event.registration_link && (
                        <div className="event-register-banner">
                            <div>
                                <h3>Interested in attending?</h3>
                                <p>Reserve your spot or register officially on the organizer site.</p>
                            </div>
                            <a href={event.registration_link} target="_blank" rel="noopener noreferrer" className="register-now-btn">
                                Register / RSVP Now <i className='bx bx-export'></i>
                            </a>
                        </div>
                    )}

                    {/* Event Description */}
                    <div className="event-body-content">
                        <h2>About This Event</h2>
                        {formattedContent}
                    </div>

                    {/* Google Maps Location Embed (FR-EVT-06) */}
                    {(event.venue_lat && event.venue_lng) && (
                        <div className="event-map-container">
                            <h2>Venue Location</h2>
                            <p className="map-address-sub"><i className='bx bx-map'></i> {event.venue_address}</p>
                            <div className="map-iframe-wrapper">
                                <iframe
                                    title="Event Venue Map"
                                    src={`https://maps.google.com/maps?q=${event.venue_lat},${event.venue_lng}&z=16&output=embed`}
                                    allowFullScreen
                                    loading="lazy"
                                />
                            </div>
                            {event.maps_url && (
                                <div className="map-external-link">
                                    <a href={event.maps_url} target="_blank" rel="noopener noreferrer">
                                        Open Location in Google Maps <i className='bx bx-link-external'></i>
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </article>
            </main>

            <Footer />
        </div>
    );
};

export default EventDetailPage;
