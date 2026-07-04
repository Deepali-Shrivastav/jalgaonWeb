"use client";

import React, { useState, useEffect } from 'react';

export interface Review {
  id: string;
  name: string;
  initials: string;
  timeAgo: string;
  rating: number;
  comment: string;
}

export interface BusinessData {
  id: string;
  name: string;
  category: string;
  displayCategory: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  timing: string;
  isOpen: boolean;
  about: string;
  tags: string[];
  phone: string;
  whatsapp: string;
  website?: string;
  heroImage: string;
  gallery: { src: string; alt: string; wide?: boolean; tall?: boolean }[];
  reviews: Review[];
  ratingBreakdown: { stars: number; pct: number }[];
}

function StarRating({ rating, max = 5, size = 'text-lg' }: { rating: number; max?: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined ${size} ${i < Math.round(rating) ? 'text-amber-400' : 'text-secondary/30'}`}
          style={{ fontVariationSettings: `'FILL' ${i < Math.round(rating) ? 1 : 0}` }}
        >
          star
        </span>
      ))}
    </div>
  );
}

interface BusinessProfileProps {
  listingId?: string;
  listingName?: string;
  onBack: () => void;
}

export default function BusinessProfile({ listingId, listingName, onBack }: BusinessProfileProps) {
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [biz, setBiz] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      setLoading(true);
      setError(null);
      try {
        const id = listingId || 'default';
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${baseUrl}/api/v1/listings/detail/?productId=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        const json = await res.json();
        setBiz(json); // Use json directly as DRF serializes the object directly
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [listingId]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (error || !biz) {
    return (
      <div className="w-full flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-red-500 mb-2">error</span>
          <p className="text-ink-deep font-bold">{error || 'Business not found'}</p>
          <button onClick={onBack} className="mt-4 text-primary font-bold hover:underline cursor-pointer">Go back</button>
        </div>
      </div>
    );
  }

  const displayedGallery = showAllGallery ? biz.gallery : biz.gallery.slice(0, 5);

  return (
    <div className="w-full">
      {/* ─── Hero Section ───────────────────────────────────────────── */}
      <section className="relative w-full h-[380px] md:h-[460px] overflow-hidden">
        <img
          src={biz.heroImage}
          alt={biz.name}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white border border-white/30 px-4 py-2 rounded-full text-sm font-bold hover:bg-white/30 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to listings
        </button>

        {/* Business title block */}
        <div className="absolute bottom-0 left-0 w-full px-6 md:px-12 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-primary text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
              {biz.category}
            </span>
            {biz.verified && (
              <span className="flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                Verified
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-md">
            {listingName ?? biz.name}
          </h1>
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-amber-400 text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="font-bold text-lg">{biz.rating}</span>
              <span className="text-white/70 text-sm">({biz.reviewCount} reviews)</span>
            </div>
            <span className="text-white/50">•</span>
            <span className={`text-sm font-medium ${biz.isOpen ? 'text-emerald-400' : 'text-red-400'}`}>
              {biz.timing}
            </span>
          </div>
        </div>
      </section>

      {/* ─── Action Bar ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-wrap gap-3 py-6 border-b border-hairline-soft">
          <a
            href={`tel:${biz.phone}`}
            className="flex items-center gap-2 bg-primary hover:bg-primary-deep text-white px-6 py-3 rounded-full font-bold text-sm transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">call</span>
            Call Now
          </a>
          <a
            href={`https://wa.me/${biz.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-700 px-6 py-3 rounded-full font-bold text-sm transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">chat</span>
            WhatsApp
          </a>
          {biz.website && (
            <a
              href={biz.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 border border-hairline-soft text-secondary hover:border-primary hover:text-primary px-6 py-3 rounded-full font-bold text-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">public</span>
              Website
            </a>
          )}
          <button className="flex items-center gap-2 border border-hairline-soft text-secondary hover:border-primary hover:text-primary px-6 py-3 rounded-full font-bold text-sm transition-all cursor-pointer">
            <span className="material-symbols-outlined text-lg">share</span>
            Share
          </button>
          <button className="flex items-center gap-2 border border-hairline-soft text-secondary hover:border-primary hover:text-primary px-6 py-3 rounded-full font-bold text-sm transition-all cursor-pointer">
            <span className="material-symbols-outlined text-lg">bookmark</span>
            Save
          </button>
        </div>

        {/* ─── Main Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-10">
          {/* Left: Main content */}
          <div className="lg:col-span-8 space-y-12">

            {/* About */}
            <section>
              <h2 className="text-2xl font-extrabold text-ink-deep mb-4">About {biz.name}</h2>
              <p className="text-secondary leading-relaxed mb-6">{biz.about}</p>
              <div className="flex flex-wrap gap-2">
                {biz.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-surface-container-low text-primary font-bold text-xs px-4 py-2 rounded-full border border-primary/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Gallery */}
            <section>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-extrabold text-ink-deep">Gallery</h2>
                <button
                  onClick={() => setShowAllGallery(!showAllGallery)}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-deep text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">grid_view</span>
                  {showAllGallery ? 'Show Less' : 'View All'}
                </button>
              </div>

              <div className="grid grid-cols-3 grid-rows-2 gap-3 auto-rows-[180px]">
                {displayedGallery.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    className={`relative overflow-hidden rounded-xl group ${i === 2 ? 'row-span-2' : ''}`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
                {/* Last item with View All overlay */}
                {biz.gallery.length > 4 && (
                  <div
                    className="relative overflow-hidden rounded-xl group col-span-2 cursor-pointer"
                    onClick={() => setShowAllGallery(true)}
                  >
                    <img
                      src={biz.gallery[4].src}
                      alt={biz.gallery[4].alt}
                      className="w-full h-full object-cover blur-sm scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-full border border-white/30">
                        <span className="text-white font-extrabold text-lg">View All</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Reviews */}
            <section className="bg-white rounded-2xl border border-hairline-soft p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-ink-deep mb-3">Customer Reviews</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-extrabold text-primary">{biz.rating}</span>
                    <div className="flex flex-col gap-1">
                      <StarRating rating={biz.rating} />
                      <span className="text-xs text-secondary">Based on {biz.reviewCount} reviews</span>
                    </div>
                  </div>
                </div>
                <button className="bg-primary hover:bg-primary-deep text-white font-bold px-7 py-3 rounded-full text-sm transition-all active:scale-95 cursor-pointer shadow-sm">
                  Write a Review
                </button>
              </div>

              {/* Rating bars */}
              <div className="space-y-2.5 mb-10">
                {biz.ratingBreakdown.map(({ stars, pct }) => (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="w-12 text-sm font-bold text-secondary">{stars} star</span>
                    <div className="flex-1 h-2 bg-surface-container-low rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-xs text-secondary">{pct}%</span>
                  </div>
                ))}
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {biz.reviews.map((rev) => (
                  <div key={rev.id} className="pb-6 border-b border-hairline-soft last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold text-sm">
                          {rev.initials}
                        </div>
                        <div>
                          <p className="font-bold text-ink-deep text-sm">{rev.name}</p>
                          <p className="text-xs text-secondary">{rev.timeAgo}</p>
                        </div>
                      </div>
                      <StarRating rating={rev.rating} size="text-sm" />
                    </div>
                    <p className="text-secondary text-sm leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Business Info Card */}
            <div className="bg-white rounded-2xl border border-hairline-soft p-6">
              <h3 className="font-extrabold text-ink-deep mb-5">Business Information</h3>
              <div className="space-y-4 text-sm text-secondary">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-primary text-lg mt-0.5">location_on</span>
                  <span>MG Road, Jalgaon, Maharashtra 425001</span>
                </div>
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                  <div>
                    <p className="font-bold text-emerald-600">{biz.isOpen ? 'Open Now' : 'Closed'}</p>
                    <p>Mon–Sat: 9:00 AM – 6:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-primary text-lg">call</span>
                  <a href={`tel:${biz.phone}`} className="hover:text-primary transition-colors">
                    {biz.phone}
                  </a>
                </div>
                {biz.website && (
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">public</span>
                    <a
                      href={biz.website}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary transition-colors truncate"
                    >
                      {biz.website.replace('https://', '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-2xl border border-hairline-soft overflow-hidden">
              <div className="h-48 bg-surface-container-low flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-4xl text-primary/40">map</span>
                <p className="text-sm text-secondary font-medium">Map view coming soon</p>
              </div>
              <div className="p-4">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full border border-primary text-primary font-bold text-sm py-3 rounded-full hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">directions</span>
                  Get Directions
                </a>
              </div>
            </div>

            {/* Claim listing CTA */}
            <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6 text-center">
              <span className="material-symbols-outlined text-primary text-3xl mb-3 block">storefront</span>
              <p className="font-bold text-ink-deep mb-1 text-sm">Is this your business?</p>
              <p className="text-xs text-secondary mb-4">Claim this listing to update details and respond to reviews.</p>
              <button className="w-full bg-primary hover:bg-primary-deep text-white font-bold text-sm py-3 rounded-full transition-all cursor-pointer">
                Claim Listing
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
