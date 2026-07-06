"use client";

import React, { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';
import BusinessClaimModal from '@/components/BusinessClaimModal';
import BusinessReportModal from '@/components/BusinessReportModal';

interface BusinessDetailClientProps {
  slug: string;
}

export default function BusinessDetailClient({ slug }: BusinessDetailClientProps) {
  const { user, isLogin } = useContext(AuthContext);
  const [businessData, setBusinessData] = useState<any>(null);
  const [relatedListings, setRelatedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/v1/listings/${slug}/`);
        if (!response.ok) throw new Error('Listing not found');
        const data = await response.json();
        setBusinessData(data);
        
        if (data.main_category_slug) {
          const relatedRes = await fetch(`${baseUrl}/api/v1/listings/?category=${data.main_category_slug}`);
          const relatedData = await relatedRes.json();
          const results = relatedData.results || relatedData;
          setRelatedListings(results.filter((item: any) => item.slug !== data.slug).slice(0, 4));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, baseUrl]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin) {
      alert('Please login to submit a review');
      return;
    }
    const token = localStorage.getItem('token');
    setIsSubmitting(true);
    try {
      const res = await fetch(`${baseUrl}/api/v1/listings/${slug}/reviews/create/`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating_star: reviewRating, user_review: reviewText })
      });
      if (res.ok) {
        setActionMsg('Review submitted successfully! It is pending moderation.');
        setReviewText('');
        setReviewRating(5);
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      alert('Failed to submit review.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setActionMsg(""), 5000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${businessData.business_name} | Jalgaon.com`,
          text: `Check out ${businessData.business_name} on Jalgaon.com!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary mb-4">progress_activity</span>
        <h2 className="text-xl font-bold text-ink-deep">Loading Business...</h2>
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="text-center py-24">
        <span className="material-symbols-outlined text-6xl text-secondary mb-4">search_off</span>
        <h2 className="text-2xl font-bold text-ink-deep">Business not found</h2>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">Return to Home</Link>
      </div>
    );
  }

  const bannerSrc = businessData.business_banner?.startsWith('http') 
      ? businessData.business_banner 
      : `${baseUrl}${businessData.business_banner || '/images/default-banner.jpg'}`;

  let businessHours = null;
  if (businessData.business_hours) {
    try {
      businessHours = typeof businessData.business_hours === 'string' 
          ? JSON.parse(businessData.business_hours) 
          : businessData.business_hours;
    } catch (e) {}
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Breadcrumbs */}
      <div className="text-sm mb-6 flex items-center text-secondary">
        <Link href="/" className="text-primary hover:underline font-medium">Home</Link>
        <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
        <span className="font-bold text-ink-deep">{businessData.business_name}</span>
      </div>

      {actionMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-6 shadow-sm">
          {actionMsg}
        </div>
      )}

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg h-[300px] md:h-[400px] mb-8 group">
        <img src={bannerSrc} alt={businessData.business_name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-md">
            {businessData.business_name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <span className="bg-primary px-3 py-1 rounded-full font-bold text-sm shadow-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">star</span>
              {businessData.avg_rating || 'New'} ({businessData.review_count || 0} reviews)
            </span>
            {businessData.main_category_name && (
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-medium text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">category</span>
                {businessData.main_category_name}
              </span>
            )}
            {businessData.city && (
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-medium text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {businessData.city}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-hairline-soft">
            <h3 className="text-2xl font-bold text-ink-deep mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span> About
            </h3>
            <p className="text-secondary leading-relaxed text-lg">
              {businessData.business_description || 'No description provided yet.'}
            </p>
            {businessData.business_dob && businessData.business_dob !== 'N/A' && (
              <p className="mt-4 text-secondary font-medium bg-surface-container-low px-4 py-2 rounded-lg inline-block border border-hairline-soft">
                Established: {businessData.business_dob}
              </p>
            )}
            
            <div className="mt-6 flex flex-wrap gap-2">
              {[businessData.sub_domain_one, businessData.sub_domain_two, businessData.sub_domain_three, businessData.sub_domain_four, businessData.sub_domain_five]
                .filter(Boolean).map((tag, idx) => (
                <span key={idx} className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold border border-primary/20">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {businessHours && Object.keys(businessHours).length > 0 && (
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-hairline-soft">
              <h3 className="text-2xl font-bold text-ink-deep mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">schedule</span> Business Hours
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  businessHours[day] && (
                    <div key={day} className="flex justify-between items-center bg-surface-container-lowest p-3 rounded-xl border border-hairline-soft">
                      <span className="capitalize font-semibold text-ink-deep">{day}</span>
                      <span className={`font-bold ${businessHours[day].closed ? 'text-red-500' : 'text-emerald-600'}`}>
                        {businessHours[day].closed ? 'Closed' : `${businessHours[day].open || ''} - ${businessHours[day].close || ''}`}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </section>
          )}

          <section className="bg-white p-8 rounded-2xl shadow-sm border border-hairline-soft">
            <h3 className="text-2xl font-bold text-ink-deep mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">reviews</span> Customer Reviews
            </h3>
            
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant mb-8">
              <h4 className="font-bold text-lg mb-4 text-ink-deep">Write a Review</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-deep mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setReviewRating(star)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <span 
                          className="material-symbols-outlined text-3xl" 
                          style={{
                            color: star <= reviewRating ? '#f59e0b' : '#cbd5e1', 
                            fontVariationSettings: star <= reviewRating ? "'FILL' 1" : "'FILL' 0"
                          }}
                        >
                          star
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-deep mb-2">Your Experience</label>
                  <textarea 
                    value={reviewText} 
                    onChange={(e) => setReviewText(e.target.value)} 
                    required 
                    rows={4} 
                    className="w-full p-4 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Tell others what you think about this business..."
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-primary-deep transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>

            <div className="space-y-4">
              {businessData.reviews && businessData.reviews.length > 0 ? (
                businessData.reviews.map((review: any, idx: number) => (
                  <div key={idx} className="bg-surface-container-lowest p-5 rounded-xl border border-hairline-soft">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-bold text-ink-deep block">{review.user_name || 'Verified User'}</span>
                        <span className="text-xs text-secondary">{new Date(review.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="flex text-yellow-500">
                        {Array(review.rating).fill(0).map((_, i) => <span key={i} className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>)}
                      </div>
                    </div>
                    <p className="text-secondary leading-relaxed">{review.review_text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-surface-container-lowest rounded-xl border border-dashed border-hairline-soft">
                  <span className="material-symbols-outlined text-4xl text-secondary/50 mb-2 block">rate_review</span>
                  <p className="text-secondary font-medium">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-hairline-soft sticky top-24">
            <h3 className="text-xl font-bold text-ink-deep mb-6 pb-4 border-b border-hairline-soft">Contact Info</h3>
            
            <div className="space-y-5 mb-8">
              {businessData.business_address && (
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary mt-1">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-ink-deep mb-1">Address</h4>
                    <p className="text-secondary text-sm">{businessData.business_address}</p>
                  </div>
                </div>
              )}
              {businessData.business_no && (
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 mt-1">
                    <span className="material-symbols-outlined text-[20px]">call</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-ink-deep mb-1">Phone</h4>
                    <p className="text-secondary text-sm font-medium">{businessData.business_no}</p>
                  </div>
                </div>
              )}
              {businessData.business_email && (
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-1">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-ink-deep mb-1">Email</h4>
                    <p className="text-secondary text-sm break-all">{businessData.business_email}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {businessData.business_no && (
                <a href={`tel:${businessData.business_no}`} className="bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-center hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">call</span> Call Now
                </a>
              )}
              {businessData.whatsapp && (
                <a href={`https://wa.me/91${businessData.whatsapp}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white font-bold py-3 px-4 rounded-xl text-center hover:bg-[#1ebe57] transition-colors shadow-sm flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">chat</span> WhatsApp
                </a>
              )}
              {businessData.gmap_link && (
                <a href={businessData.gmap_link} target="_blank" rel="noopener noreferrer" className="bg-surface-container-low text-ink-deep font-bold py-3 px-4 rounded-xl text-center border border-hairline-soft hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">directions</span> Get Directions
                </a>
              )}
              <button onClick={handleShare} className="bg-white text-primary border-2 border-primary font-bold py-3 px-4 rounded-xl text-center hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">share</span> Share Profile
              </button>
              
              <div className="flex gap-2 mt-4 pt-4 border-t border-hairline-soft">
                <button 
                  onClick={() => setIsClaimModalOpen(true)}
                  className="flex-1 bg-surface text-ink-deep font-semibold py-2 px-3 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span> Claim
                </button>
                <button 
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex-1 bg-surface text-red-600 font-semibold py-2 px-3 rounded-lg border border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">flag</span> Report
                </button>
              </div>
            </div>
            
            {(businessData.website_link || businessData.insta_link || businessData.facebook_link) && (
              <div className="mt-8 pt-6 border-t border-hairline-soft text-center">
                <h4 className="text-sm font-bold text-secondary mb-4 uppercase tracking-widest">Connect</h4>
                <div className="flex justify-center gap-4">
                  {businessData.website_link && (
                    <a href={businessData.website_link} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-slate-600">
                      <span className="material-symbols-outlined">language</span>
                    </a>
                  )}
                  {businessData.insta_link && (
                    <a href={businessData.insta_link} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-[#E1306C] hover:text-white transition-colors text-slate-600">
                      <span className="material-symbols-outlined">photo_camera</span>
                    </a>
                  )}
                  {businessData.facebook_link && (
                    <a href={businessData.facebook_link} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors text-slate-600">
                      <span className="material-symbols-outlined">groups</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <BusinessClaimModal 
        isOpen={isClaimModalOpen} 
        onClose={() => setIsClaimModalOpen(false)} 
        business={businessData} 
        baseUrl={baseUrl} 
      />
      
      <BusinessReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        business={businessData} 
        baseUrl={baseUrl} 
      />
    </div>
  );
}
