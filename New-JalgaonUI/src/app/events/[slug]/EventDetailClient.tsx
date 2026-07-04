'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

interface EventDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  featured_image: string | null;
  category: { id: number, name: string, slug: string } | null;
  organizer_name: string;
  venue_name: string;
  venue_address: string;
  start_datetime: string;
  end_datetime: string | null;
  registration_link: string | null;
  view_count: number;
}

export default function EventDetailClient({ slug }: { slug: string }) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/v1/events/${encodeURIComponent(slug)}/`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Event not found');
          throw new Error('Failed to fetch event details');
        }
        const data = await res.json();
        setEvent(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="w-full flex flex-col justify-center items-center py-20">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
        <h2 className="text-2xl font-bold text-ink-deep mb-4">{error || 'Event not found'}</h2>
        <Link href="/events" className="text-primary font-bold hover:underline">
          &larr; Back to Events
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.start_datetime);
  const isPast = startDate < new Date();

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-hairline-soft overflow-hidden">
      {event.featured_image ? (
        <div className="w-full h-[400px] overflow-hidden">
          <img
            src={event.featured_image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-[200px] bg-primary/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-6xl text-primary/30">event</span>
        </div>
      )}
      
      <div className="p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          {event.category && (
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              {event.category.name}
            </span>
          )}
          {isPast && (
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Past Event
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-ink-deep mb-6 leading-tight">
          {event.title}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-10 border-b border-hairline-soft bg-surface-container-lowest p-6 rounded-xl border">
          <div>
            <h4 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">When</h4>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary mt-0.5">calendar_today</span>
              <div>
                <p className="font-bold text-ink-deep">
                  {startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-secondary">{startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Where</h4>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary mt-0.5">location_on</span>
              <div>
                <p className="font-bold text-ink-deep">{event.venue_name}</p>
                <p className="text-secondary text-sm">{event.venue_address}</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Organizer</h4>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary mt-0.5">person</span>
              <p className="font-bold text-ink-deep">{event.organizer_name || 'Community Event'}</p>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary mb-12">
          {event.description ? (
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }} />
          ) : (
            <p className="text-secondary">{event.short_description}</p>
          )}
        </div>

        {event.registration_link && !isPast && (
          <div className="flex justify-center pt-8 border-t border-hairline-soft">
            <a 
              href={event.registration_link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary hover:bg-primary-deep text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              Register Now <span className="material-symbols-outlined">open_in_new</span>
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
