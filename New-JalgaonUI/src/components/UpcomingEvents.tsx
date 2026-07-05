"use client";

import React, { useState, useEffect } from "react";

export interface EventItem {
  id?: number;
  month?: string;
  day?: string;
  isoDate?: string;
  title: string;
  location?: string;
  venue?: string;
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/`
          : '/api/v1/events/';
        const res = await fetch(url);
        if (!res.ok) {
          // Backend might not have this endpoint yet, handle gracefully
          console.warn('Events API not available yet');
          setEvents([]);
          return;
        }
        const json = await res.json();
        const results = json.results || json.data || json || [];
        
        const mappedEvents = results.slice(0, 4).map((item: any) => {
          const startDate = item.start_datetime ? new Date(item.start_datetime) : new Date();
          return {
            id: item.id,
            slug: item.slug,
            month: startDate.toLocaleString('en-US', { month: 'short' }),
            day: startDate.getDate().toString().padStart(2, '0'),
            isoDate: item.start_datetime || '',
            title: item.title,
            location: item.venue_name || item.venue_address || 'TBA',
            venue: item.venue_name || item.venue_address || 'TBA'
          };
        });
        
        setEvents(mappedEvents);
      } catch (err) {
        // Silently swallow network errors so Next.js doesn't pop up the dev overlay
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <section id="events" className="bg-surface-container-low py-xxxl sm:py-section" aria-labelledby="events-heading">
      <div className="mx-auto max-w-container-max px-base sm:px-xxl">
        <h2 id="events-heading" className="mb-xl text-2xl font-extrabold text-ink-deep sm:text-3xl">Upcoming Events</h2>

        {loading ? (
          <div className="hide-scrollbar flex gap-base overflow-x-auto pb-xs">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex min-h-[108px] w-[310px] shrink-0 items-center gap-base rounded-[22px] border border-hairline-soft bg-white p-base animate-pulse">
                <div className="h-16 w-16 rounded-full bg-surface-container-low shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-surface-container-low rounded w-3/4"></div>
                  <div className="h-3 bg-surface-container-low rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="text-secondary">No upcoming events currently.</p>
        ) : (
          <div className="hide-scrollbar flex snap-x snap-mandatory gap-base overflow-x-auto pb-xs">
            {events.map((event) => (
              <article key={event.id || event.title} className="group flex min-h-[108px] w-[310px] shrink-0 snap-start items-center gap-base rounded-[22px] border border-hairline-soft bg-white p-base transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg">
                <time dateTime={event.isoDate || ''} className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider">{event.month || 'TBD'}</span>
                  <span className="text-2xl font-black leading-none">{event.day || '00'}</span>
                </time>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold leading-tight text-ink-deep">{event.title}</h3>
                  <p className="mt-xs flex items-center gap-xxs truncate text-xs leading-snug text-secondary">
                    <span className="material-symbols-outlined text-sm text-secondary" aria-hidden="true">location_on</span>
                    {event.location || event.venue || 'TBA'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
