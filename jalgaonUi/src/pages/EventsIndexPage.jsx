import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import EventCard from '../components/Events/EventCard';
import EventCategoryFilter from '../components/Events/EventCategoryFilter';
import './EventsIndexPage.css';

const EventsIndexPage = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchEvents = useCallback(async (tab, categorySlug, pageNum, append = false) => {
        setLoading(true);
        try {
            const endpoint = tab === 'past' 
                ? `${djangoApi}/api/v1/events/past/` 
                : `${djangoApi}/api/v1/events/`;

            const params = { page: pageNum };
            if (categorySlug) {
                params.category = categorySlug;
            }

            const response = await axios.get(endpoint, { params });
            const newEvents = response.data.results || response.data;

            if (append) {
                setEvents(prev => [...prev, ...newEvents]);
            } else {
                setEvents(newEvents);
            }

            setHasMore(!!response.data.next);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    }, [djangoApi]);

    useEffect(() => {
        setPage(1);
        fetchEvents(activeTab, currentCategory, 1);
    }, [activeTab, currentCategory, fetchEvents]);

    const handleCategoryChange = (slug) => {
        setCurrentCategory(slug);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchEvents(activeTab, currentCategory, nextPage, true);
    };

    return (
        <div className="events-index-page">
            <Navbar />

            <div className="events-container">
                <div className="events-page-header">
                    <div>
                        <h1 className="events-page-title">
                            <i className='bx bx-calendar' style={{ color: '#7c3aed', marginRight: '10px' }}></i>
                            Events in Jalgaon
                        </h1>
                        <p className="events-page-subtitle">Discover local concerts, exhibitions, sports, and cultural festivals</p>
                    </div>

                    <Link to="/events/submit" className="submit-event-btn">
                        <i className='bx bx-plus-circle'></i> Submit Event
                    </Link>
                </div>

                {/* Tab switcher */}
                <div className="events-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => handleTabChange('upcoming')}
                    >
                        Upcoming Events
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                        onClick={() => handleTabChange('past')}
                    >
                        Past Events Archive
                    </button>
                </div>

                <EventCategoryFilter 
                    currentCategory={currentCategory} 
                    onCategoryChange={handleCategoryChange} 
                />

                {loading && page === 1 ? (
                    <div className="events-loading">
                        <div className="spinner"></div>
                        <p>Loading events...</p>
                    </div>
                ) : events.length > 0 ? (
                    <div className="events-grid">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="events-empty-state">
                        <i className='bx bx-calendar-x' style={{ fontSize: '3.5rem', color: '#cbd5e1' }}></i>
                        <h3>No events found</h3>
                        <p>There are no {activeTab} events matching your selected filter.</p>
                    </div>
                )}

                {hasMore && (
                    <div className="load-more-container">
                        <button 
                            className="load-more-btn" 
                            onClick={handleLoadMore}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Load More Events'}
                        </button>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default EventsIndexPage;
