"use client";

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
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
  address: string;
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
  const { isLogin } = useContext(AuthContext);
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [biz, setBiz] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Form states
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [claimForm, setClaimForm] = useState({ message: '', contact_number: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: biz?.name,
          text: `Check out ${biz?.name} on Jalgaon.com`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleSave = async () => {
    if (!isLogin) {
      toast.error('Please login to save listings');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/listings/user/favorites/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shop_listing_id: parseInt(biz!.id) })
      });
      if (res.ok) {
        toast.success('Listing saved to favorites');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save listing');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin) {
      toast.error('Please login to write a review');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/listings/${encodeURIComponent(listingId || '')}/reviews/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating_star: reviewForm.rating,
          user_review: reviewForm.comment
        })
      });
      if (res.ok) {
        toast.success('Review submitted successfully');
        setShowReviewModal(false);
        setReviewForm({ rating: 5, comment: '' });
      } else if (res.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.detail || errorData.error || 'Failed to submit review');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin) {
      toast.error('Please login to claim this listing');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/listings/${encodeURIComponent(listingId || '')}/claim/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(claimForm)
      });
      if (res.ok) {
        toast.success('Claim request submitted successfully');
        setShowClaimModal(false);
        setClaimForm({ message: '', contact_number: '' });
      } else {
        toast.error('Failed to submit claim request');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchBusiness = async () => {
      setLoading(true);
      setError(null);
      try {
        const id = listingId || 'default';
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/v1/listings/${encodeURIComponent(id)}/`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        const drfData = await res.json();
        
        const mappedReviews = drfData.reviews?.map((r: any) => ({
          id: r.id?.toString(),
          name: r.user_name || 'User',
          initials: (r.user_name || 'U').substring(0, 1).toUpperCase(),
          timeAgo: new Date(r.timestamp).toLocaleDateString(),
          rating: r.rating_star || r.rating || 5,
          comment: r.user_review || r.comment || ''
        })) || [];

        const totalReviews = mappedReviews.length;
        const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        mappedReviews.forEach((r: any) => {
          const rating = Math.round(r.rating);
          if (rating >= 1 && rating <= 5) {
            ratingCounts[rating as keyof typeof ratingCounts]++;
          }
        });

        const computedRatingBreakdown = [5, 4, 3, 2, 1].map(stars => ({
          stars,
          pct: totalReviews > 0 ? Math.round((ratingCounts[stars as keyof typeof ratingCounts] / totalReviews) * 100) : 0
        }));

          // Map DRF fields to BusinessData
          const rawWebsite = drfData.website_link || drfData.sub_domain_one || '';
          const formattedWebsite = rawWebsite 
            ? (rawWebsite.startsWith('http') ? rawWebsite : `https://${rawWebsite}`) 
            : undefined;

          const mappedBiz: BusinessData = {
            id: drfData.id?.toString() || id,
            name: drfData.business_name || 'Unknown Business',
            category: drfData.main_category_name || 'Category',
            displayCategory: drfData.sub_category_name || drfData.main_category_name || 'Category',
            verified: drfData.is_claimed || true,
            rating: drfData.avg_rating || 0,
            reviewCount: drfData.review_count || 0,
            timing: drfData.business_hours || 'Contact for hours',
            isOpen: true,
            about: drfData.business_description || 'No description available.',
            tags: [drfData.main_category_name, drfData.sub_category_name].filter(Boolean) as string[],
            address: `${drfData.business_address || ''}, ${drfData.city || ''}`.replace(/^, |^,$/, '').trim() || 'Address not available',
            phone: drfData.business_no || '',
            whatsapp: drfData.whatsapp || drfData.business_no || '',
            website: formattedWebsite,
            heroImage: drfData.business_banner || 'https://via.placeholder.com/1200x600?text=No+Image',
          gallery: drfData.gallery_photos?.length > 0 
            ? drfData.gallery_photos.map((p: any) => ({ src: p.image, alt: p.caption || 'Gallery Image' }))
            : [
                { src: drfData.business_banner, alt: 'Banner' } // Fallback to banner if no gallery
              ],
          reviews: mappedReviews,
          ratingBreakdown: computedRatingBreakdown
        };
        setBiz(mappedBiz);
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
    <div className="w-full relative">
      <Toaster position="top-center" />
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
          <button onClick={handleShare} className="flex items-center gap-2 border border-hairline-soft text-secondary hover:border-primary hover:text-primary px-6 py-3 rounded-full font-bold text-sm transition-all cursor-pointer">
            <span className="material-symbols-outlined text-lg">share</span>
            Share
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 border border-hairline-soft text-secondary hover:border-primary hover:text-primary px-6 py-3 rounded-full font-bold text-sm transition-all cursor-pointer">
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
                <button onClick={() => setShowReviewModal(true)} className="bg-primary hover:bg-primary-deep text-white font-bold px-7 py-3 rounded-full text-sm transition-all active:scale-95 cursor-pointer shadow-sm">
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
                  <span>{biz.address}</span>
                </div>
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                  <div>
                    <p className="font-bold text-emerald-600">{biz.isOpen ? 'Open Now' : 'Closed'}</p>
                    <p>{biz.timing}</p>
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
              <button onClick={() => setShowClaimModal(true)} className="w-full bg-primary hover:bg-primary-deep text-white font-bold text-sm py-3 rounded-full transition-all cursor-pointer">
                Claim Listing
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-2xl relative animate-fade-in flex flex-col" style={{ width: '90%', maxWidth: '500px' }}>
            <button onClick={() => setShowReviewModal(false)} className="absolute top-4 right-4 text-secondary hover:text-ink-deep">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-2xl font-bold text-ink-deep mb-4">Write a Review</h2>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Rating</label>
                <select 
                  className="w-full border border-hairline-soft rounded-lg p-3 outline-none" 
                  value={reviewForm.rating} 
                  onChange={(e) => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}
                >
                  <option value="5">5 Stars - Excellent</option>
                  <option value="4">4 Stars - Good</option>
                  <option value="3">3 Stars - Average</option>
                  <option value="2">2 Stars - Poor</option>
                  <option value="1">1 Star - Terrible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Your Review</label>
                <textarea 
                  required 
                  minLength={5}
                  className="w-full border border-hairline-soft rounded-lg p-3 outline-none min-h-[120px]" 
                  placeholder="Share your experience..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                ></textarea>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-primary hover:bg-primary-deep text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-2xl relative animate-fade-in flex flex-col" style={{ width: '90%', maxWidth: '500px' }}>
            <button onClick={() => setShowClaimModal(false)} className="absolute top-4 right-4 text-secondary hover:text-ink-deep">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-2xl font-bold text-ink-deep mb-4">Claim this Business</h2>
            <p className="text-secondary text-sm mb-6">Provide your contact details and a message to verify ownership.</p>
            <form onSubmit={submitClaim} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Contact Number *</label>
                <input 
                  type="tel" 
                  required 
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
                  className="w-full border border-hairline-soft rounded-lg p-3 outline-none" 
                  placeholder="Your mobile number"
                  value={claimForm.contact_number}
                  onChange={(e) => setClaimForm({...claimForm, contact_number: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Message *</label>
                <textarea 
                  required 
                  minLength={10}
                  className="w-full border border-hairline-soft rounded-lg p-3 outline-none min-h-[100px]" 
                  placeholder="Tell us about your ownership..."
                  value={claimForm.message}
                  onChange={(e) => setClaimForm({...claimForm, message: e.target.value})}
                ></textarea>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-primary hover:bg-primary-deep text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit Claim Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
