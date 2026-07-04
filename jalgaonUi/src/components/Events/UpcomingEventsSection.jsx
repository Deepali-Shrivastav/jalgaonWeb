import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EventCard from './EventCard';
import './UpcomingEventsSection.css';

const UpcomingEventsSection = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/events/`);
                const results = response.data.results || response.data;
                setEvents(results.slice(0, 3)); // show top 3 upcoming approved events
                setLoading(false);
            } catch (error) {
                console.error("Error fetching upcoming homepage events:", error);
                setLoading(false);
            }
        };
        fetchUpcoming();
    }, [djangoApi]);

    if (loading || !events.length) return null;

    return (
        <section className="upcoming-events-section">
            <div className="section-container">
                <div className="section-header">
                    <h2 className="section-title">
                        <i className='bx bx-calendar-event' style={{ color: '#7c3aed', marginRight: '8px' }}></i>
                        Upcoming Events in Jalgaon
                    </h2>
                    <Link to="/events" className="view-all-link">
                        View All Events →
                    </Link>
                </div>

                <div className="upcoming-events-grid">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UpcomingEventsSection;
