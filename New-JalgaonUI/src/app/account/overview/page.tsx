'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';

export default function OverviewPage() {
  const { isLogin } = useContext(AuthContext);
  const [counts, setCounts] = useState({
    listings: 0,
    savedListings: 0,
    jobs: 0,
    applications: 0,
    events: 0,
    ads: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLogin) return;

    const fetchCounts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const headers = { 'Authorization': `Bearer ${token}` };

        const [listingsRes, favoritesRes, jobsRes, appsRes, eventsRes, adsRes] = await Promise.all([
          fetch(`${baseUrl}/api/v1/listings/user/my-listings/`, { headers }).catch(() => null),
          fetch(`${baseUrl}/api/v1/listings/user/favorites/`, { headers }).catch(() => null),
          fetch(`${baseUrl}/api/v1/jobs/my-jobs/`, { headers }).catch(() => null),
          fetch(`${baseUrl}/api/v1/jobs/my-applications/`, { headers }).catch(() => null),
          fetch(`${baseUrl}/api/v1/events/my-events/`, { headers }).catch(() => null),
          fetch(`${baseUrl}/api/v1/ads/my-ads/`, { headers }).catch(() => null),
        ]);

        const getCount = async (res: Response | null) => {
          if (!res || !res.ok) return 0;
          try {
            const data = await res.json();
            const list = data.results || data.data || data || [];
            return Array.isArray(list) ? list.length : 0;
          } catch {
            return 0;
          }
        };

        const [listings, savedListings, jobs, applications, events, ads] = await Promise.all([
          getCount(listingsRes),
          getCount(favoritesRes),
          getCount(jobsRes),
          getCount(appsRes),
          getCount(eventsRes),
          getCount(adsRes),
        ]);

        setCounts({ listings, savedListings, jobs, applications, events, ads });
      } catch (err) {
        console.error("Error fetching overview counts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [isLogin]);

  const cards = [
    {
      title: 'My Listings',
      count: counts.listings,
      desc: 'Manage your business profiles.',
      icon: 'storefront',
      color: 'bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary',
      href: '/account/my-listings',
    },
    {
      title: 'Saved Listings',
      count: counts.savedListings,
      desc: 'Your bookmarked businesses.',
      icon: 'favorite',
      color: 'bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-600',
      href: '/account/saved-listings',
    },
    {
      title: 'My Jobs',
      count: counts.jobs,
      desc: 'Track your job postings.',
      icon: 'work',
      color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-600',
      href: '/account/my-jobs',
    },
    {
      title: 'My Applications',
      count: counts.applications,
      desc: 'Jobs you have applied for.',
      icon: 'description',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-600',
      href: '/account/applications',
    },
    {
      title: 'My Events',
      count: counts.events,
      desc: 'Manage your event submissions.',
      icon: 'event',
      color: 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-600',
      href: '/account/my-events',
    },
    {
      title: 'My Ads',
      count: counts.ads,
      desc: 'Your advertising campaigns.',
      icon: 'campaign',
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-600',
      href: '/account/ads',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-ink-deep mb-6 pb-4 border-b border-hairline-soft">
        Account Overview
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <Link
            key={i}
            href={card.href}
            className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:shadow-sm ${card.color}`}
          >
            <span className="material-symbols-outlined text-4xl mb-3">{card.icon}</span>
            <h3 className="font-bold text-ink-deep text-2xl mb-1">
              {loading ? '...' : card.count}
            </h3>
            <h4 className="font-bold text-ink-deep text-lg mb-1">{card.title}</h4>
            <p className="text-xs text-secondary">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
