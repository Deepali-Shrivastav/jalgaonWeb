"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export interface TrendingListing {
  id?: number | string;
  name: string;
  category: string;
  rating: string | number;
  location: string;
  image: string;
  verified?: boolean;
}

interface TrendingListingsProps {
  selectedCity?: string;
}

export default function TrendingListings({ selectedCity }: TrendingListingsProps) {
  const [listings, setListings] = useState<TrendingListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/listings/trending/`
          : '/api/v1/listings/trending/';
        const res = await fetch(url);
        if (!res.ok) {
          console.warn('Trending Listings API not available yet');
          setListings([]);
          return;
        }
        const json = await res.json();
        const results = json.results || json.data || json || [];
        
        // Map DRF ListingListSerializer to TrendingListing
        const mappedResults = results.map((item: any) => ({
          id: item.slug || item.id,
          name: item.business_name,
          category: item.main_category_name || 'Business',
          rating: item.avg_rating || 4.0,
          location: item.city || 'Jalgaon',
          image: item.business_banner || '',
          verified: true
        }));
        
        setListings(mappedResults);
      } catch (err) {
        // Silently swallow network errors so Next.js doesn't pop up the dev overlay
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const filteredListings = selectedCity
    ? listings.filter(item => item.location.toLowerCase() === selectedCity.toLowerCase())
    : listings;

  const displayListings = filteredListings.slice(0, 4);

  return (
    <section className="py-section bg-white">
      <div className="max-w-container-max mx-auto px-xxl">
        <div className="flex justify-between items-end mb-xxl">
          <div>
            <h2 className="text-3xl font-extrabold text-ink-deep mb-xxs">Trending Listings</h2>
            <p className="text-secondary">The most visited local hotspots this week</p>
          </div>
          <Link className="text-primary font-bold flex items-center gap-xxs hover:underline group" href="/">
            View All <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-xl">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-xl bg-surface-container-low animate-pulse"></div>
            ))}
          </div>
        ) : displayListings.length === 0 ? (
          <p className="text-secondary text-center py-8">No trending listings in {selectedCity || 'Jalgaon'} right now.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-xl">
            {displayListings.map((listing, idx) => (
              <div key={listing.id || idx} className="group cursor-pointer">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-base shadow-sm group-hover:shadow-xl transition-all duration-500">
                  {listing.image ? (
                    <img 
                      alt={listing.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      src={listing.image} 
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-container-low flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-4xl">store</span>
                    </div>
                  )}
                  <div className="absolute top-base left-base bg-white/95 backdrop-blur px-base py-xxs rounded-full text-[10px] text-primary font-extrabold uppercase tracking-wider">
                    {listing.category || 'Business'}
                  </div>
                  {listing.verified && (
                    <div className="absolute top-base right-base bg-primary text-white px-base py-xxs rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                      Verified
                    </div>
                  )}
                </div>
                
                <div className="space-y-xxs">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-ink-deep text-lg group-hover:text-primary transition-colors">{listing.name}</h3>
                    <div className="flex items-center gap-xxs">
                      <span className="material-symbols-outlined text-yellow-500 text-sm fill-1" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                      <span className="font-bold text-sm text-ink-deep">{listing.rating || '4.0'}</span>
                    </div>
                  </div>
                  <p className="text-secondary text-sm flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm text-primary">location_on</span> {listing.location || 'Jalgaon'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
