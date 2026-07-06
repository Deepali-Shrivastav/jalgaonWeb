'use client';

import React, { useState } from 'react';
// import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Pagination from '@/components/Pagination';
import SkeletonCard from '@/components/SkeletonCard';



export interface EventItem {
  id: number;
  category: any;
  month: string;
  day: string;
  title: string;
  venue?: string;
  time?: string;
  excerpt?: string;
  price: string;
  cta: string;
  image: string;
  alt?: string;
}

export default function EventsPortal() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [categories, setCategories] = useState<any[]>([{ id: 'all', name: 'All Categories', slug: 'all' }]);
  
  const [featuredEvents, setFeaturedEvents] = useState<EventItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/v1/events/categories/`);
        if (res.ok) {
          const data = await res.json();
          setCategories([{ id: 'all', name: 'All Categories', slug: 'all' }, ...(data.results || data)]);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const url = new URL(`${baseUrl}/api/v1/events/`);
        if (activeCategory !== 'all') {
          url.searchParams.append('category', activeCategory);
        }
        url.searchParams.append('page', page.toString());
        
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed to fetch events');
        const json = await res.json();
        const results = json.results || json.data || json || [];
        const mappedResults = results.map((item: any) => {
          const startDate = item.start_datetime ? new Date(item.start_datetime) : new Date();
          return {
            id: item.id,
            category: item.category,
            month: startDate.toLocaleString('default', { month: 'short' }),
            day: startDate.getDate().toString(),
            title: item.title,
            venue: item.venue_name || item.venue_address || 'Online',
            time: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            excerpt: item.short_description,
            price: 'Free',
            cta: 'View Details',
            image: item.featured_image || '/placeholder-event.jpg',
            alt: item.title
          };
        });
        
        if (mappedResults.length > 0) {
          if (page === 1) {
            setFeaturedEvents(mappedResults.slice(0, 3));
            setUpcomingEvents(mappedResults.slice(3, 9).length > 0 ? mappedResults.slice(3, 9) : mappedResults);
          } else {
            setUpcomingEvents(mappedResults);
          }
        } else {
          if (page === 1) setFeaturedEvents([]);
          setUpcomingEvents([]);
        }
        
        if (json.count !== undefined) {
          setTotalPages(Math.ceil(json.count / 20));
        } else {
          setTotalPages(1);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [activeCategory, page]);

  React.useEffect(() => { setPage(1); }, [activeCategory]);

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ─── Hero Section ─── */}
        <section
          id="events-hero"
          className="relative w-full min-h-[420px] md:min-h-[500px] flex items-center justify-center overflow-hidden"
          aria-label="Events search"
        >
          <div className="absolute inset-0 hero-gradient" />
          <div className="relative z-10 w-full max-w-4xl px-base flex flex-col items-center text-center gap-8 py-16">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-ink-deep tracking-tight">
                Discover Events in{' '}
                <span className="text-primary">Jalgaon</span>
              </h1>
              <p className="text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                From vibrant local festivals and grand business summits to
                thrilling sports tournaments, find exactly what&apos;s happening
                in your city.
              </p>
            </div>
            <div className="w-full bg-white p-2 rounded-full shadow-xl flex items-center gap-2 border border-hairline-soft max-w-2xl">
              <div className="flex-1 flex items-center px-4 gap-3">
                <span className="material-symbols-outlined text-outline">
                  search
                </span>
                <input
                  className="w-full border-none focus:ring-0 text-ink-deep bg-transparent py-3 text-base placeholder:text-secondary"
                  placeholder="Search for events (Cultural, Business, Tech...)"
                  type="search"
                  aria-label="Search events"
                />
              </div>
              <button className="bg-primary text-white px-8 py-3 rounded-full font-bold tracking-wide hover:bg-primary-deep transition-colors active:scale-95">
                Search
              </button>
            </div>
            {/* <Link 
              href="/add-event" 
              className="bg-white/85 hover:bg-white text-primary border border-primary/20 px-8 py-3 rounded-full font-bold transition-all text-sm flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Submit Your Event
            </Link> */}
          </div>
        </section>

        {loading ? (
          <div className="max-w-container-max mx-auto px-xxl py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 bg-white">
            <span className="material-symbols-outlined text-4xl mb-4">error</span>
            <h3 className="text-lg font-bold">Failed to load events</h3>
          </div>
        ) : (
          <>
            {/* ─── Featured Events (Carousel) ─── */}
            {page === 1 && featuredEvents.length > 0 && (
            <section
              id="featured-events"
              className="py-12 bg-white"
              aria-label="Featured events"
            >
          <div className="max-w-container-max mx-auto px-xxl">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-primary font-bold text-xs uppercase tracking-widest">
                  Selected for you
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-ink-deep mt-1">
                  Featured Events
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-2 rounded-full border border-hairline-soft hover:bg-surface-container-low transition-colors"
                  aria-label="Previous events"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  className="p-2 rounded-full border border-hairline-soft hover:bg-surface-container-low transition-colors"
                  aria-label="Next events"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="flex gap-xl overflow-x-auto hide-scrollbar pb-8 snap-x">
              {featuredEvents.map((event) => (
                <article
                  key={event.id}
                  className="min-w-[300px] md:min-w-[400px] snap-start group flex-shrink-0"
                >
                  <div className="relative h-56 md:h-64 w-full rounded-xl overflow-hidden">
                    <img
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      src={event.image}
                      alt={event.alt}
                      loading="lazy"
                      width={420}
                      height={260}
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-extrabold text-primary shadow-sm">
                      {event.category?.name || 'Uncategorized'}
                    </div>
                    <div className="absolute top-4 right-4 bg-primary text-white flex flex-col items-center justify-center w-14 h-14 rounded-2xl font-bold leading-none shadow-lg">
                      <span className="text-[10px] uppercase">
                        {event.month}
                      </span>
                      <span className="text-xl">{event.day}</span>
                    </div>
                  </div>
                  <div className="mt-5 px-1">
                    <h3 className="text-lg md:text-xl font-bold text-ink-deep">
                      {event.title}
                    </h3>
                    <p className="flex items-center gap-1 text-secondary text-sm mt-1">
                      <span className="material-symbols-outlined text-[18px]">
                        location_on
                      </span>
                      {event.venue}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-primary font-bold text-lg">
                        {event.price}
                      </span>
                      <a 
                        href={event.venue && event.venue !== 'Online' ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}` : '#'}
                        target={event.venue && event.venue !== 'Online' ? "_blank" : undefined}
                        rel={event.venue && event.venue !== 'Online' ? "noopener noreferrer" : undefined}
                        className="bg-primary text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-primary-deep hover:shadow-lg transition-all active:scale-95 inline-block text-center"
                      >
                        {event.cta}
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ─── Upcoming Events Grid ─── */}
        <section
          id="upcoming-events"
          className="py-16 bg-surface"
          aria-label="Upcoming events"
        >
          <div className="max-w-container-max mx-auto px-xxl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-ink-deep">
                  Upcoming Events
                </h2>
                <p className="text-secondary mt-2">
                  Plan your calendar with these amazing experiences.
                </p>
              </div>
              <nav
                className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0"
                aria-label="Event category filters"
              >
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.slug)}
                    className={`whitespace-nowrap px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
                      activeCategory === cat.slug
                        ? 'bg-primary text-white'
                        : 'border border-hairline-soft text-secondary hover:bg-surface-container-low'
                    }`}
                    aria-pressed={activeCategory === cat.slug}
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <article
                  key={event.id}
                  className="bg-white rounded-xl overflow-hidden event-card-shadow flex flex-col"
                >
                  <div className="h-52 md:h-56 relative group overflow-hidden">
                    <img
                      className="absolute inset-0 w-full h-full object-cover"
                      src={event.image}
                      alt={event.alt}
                      loading="lazy"
                      width={420}
                      height={230}
                    />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-white text-ink-deep px-4 py-1 rounded-full text-[10px] font-black shadow-md tracking-wider">
                        {event.category?.name || 'Uncategorized'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <div className="flex gap-4 items-start mb-4">
                      <div className="bg-surface-container-low rounded-2xl p-2 flex flex-col items-center min-w-[56px]">
                        <span className="text-[10px] text-secondary font-bold uppercase">
                          {event.month}
                        </span>
                        <span className="text-2xl font-black text-primary">
                          {event.day}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg font-bold text-ink-deep leading-snug">
                          {event.title}
                        </h3>
                        <p className="text-sm text-secondary mt-1">
                          {event.time}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto space-y-4">
                      <p className="text-sm text-secondary line-clamp-2 leading-relaxed">
                        {event.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-hairline-soft">
                        <span className="text-ink-deep font-bold">
                          {event.price}
                        </span>
                        <a 
                          href={event.venue && event.venue !== 'Online' ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}` : '#'}
                          target={event.venue && event.venue !== 'Online' ? "_blank" : undefined}
                          rel={event.venue && event.venue !== 'Online' ? "noopener noreferrer" : undefined}
                          className="bg-primary text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-primary-deep transition-colors active:scale-95 inline-block text-center"
                        >
                          {event.cta}
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-16 pb-12">
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={setPage} 
              />
            </div>
          </div>
        </section>
        </>
      )}
      </main>
      <Footer />
    </>
  );
}
