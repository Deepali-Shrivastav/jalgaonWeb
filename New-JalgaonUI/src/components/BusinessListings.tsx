"use client";

import React, { useState, useEffect } from 'react';

export interface Listing {
  id: string;
  name: string;
  category: string;
  displayCategory: string;
  rating: number;
  ratingCount: number;
  featured: boolean;
  verified: boolean;
  address: string;
  distance: number;
  timing: string;
  timingColor: string;
  image: string;
  phone: string;
  city?: string;
}

import { useRouter } from 'next/navigation';

export interface BusinessListingsProps {
  category?: string | null;
  searchQuery?: string | null;
  selectedCity?: string | null;
  onBack?: () => void;
  onSelectListing?: (id: string, name: string) => void;
}

export default function BusinessListings({ category, searchQuery, selectedCity, onBack, onSelectListing }: BusinessListingsProps) {
  const router = useRouter();
  
  const handleSelect = (id: string, name: string) => {
    if (onSelectListing) {
      onSelectListing(id, name);
    } else {
      router.push(`/directory/${id}`);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/');
    }
  };
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        let endpoint = '';
        if (searchQuery) {
          endpoint = `/api/v1/search/?search=${encodeURIComponent(searchQuery)}`;
        } else if (category) {
          endpoint = `/api/v1/listings/?category=${encodeURIComponent(category)}`;
        } else {
          endpoint = `/api/v1/listings/`; // Fallback
        }

        const url = process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`
          : endpoint;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        
        const backendResults = json.results || json.data || json || [];
        
        // Map backend fields to frontend interface
        const mappedListings: Listing[] = backendResults.map((item: any) => ({
          id: item.slug || item.id,
          name: item.business_name || '',
          category: item.main_category_name || '',
          displayCategory: item.main_category_name || '',
          rating: parseFloat(item.avg_rating) || 0,
          ratingCount: item.review_count || 0,
          featured: item.is_trending || false,
          verified: item.is_verified || false,
          address: item.business_address || '',
          distance: 0, // Backend handles distance if lat/lng are provided
          timing: 'Open',
          timingColor: 'text-green-500',
          image: item.business_banner || 'https://via.placeholder.com/400x300?text=No+Image',
          phone: item.business_no || '',
          city: item.city || 'Jalgaon'
        }));
        
        setListings(mappedListings);
        
        // Dynamically set categories based on results
        const uniqueCategories = Array.from(new Set(mappedListings.map(l => l.category))) as string[];
        setSelectedCategories(uniqueCategories);
        setAppliedCategories(uniqueCategories);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [category]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(20);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('Relevance');

  // Interactive filtering states (applied on click of Apply Filters or live-updated)
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [appliedMinRating, setAppliedMinRating] = useState<number | null>(null);
  const [appliedMaxDistance, setAppliedMaxDistance] = useState<number>(20);
  const [appliedOpenNowOnly, setAppliedOpenNowOnly] = useState<boolean>(false);

  const handleCategoryChange = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const applyFilters = () => {
    setAppliedCategories(selectedCategories);
    setAppliedMinRating(minRating);
    setAppliedMaxDistance(maxDistance);
    setAppliedOpenNowOnly(openNowOnly);
  };

  const clearFilters = () => {
    setSelectedCategories(availableCategories);
    setMinRating(null);
    setMaxDistance(20);
    setOpenNowOnly(false);
    
    setAppliedCategories(availableCategories);
    setAppliedMinRating(null);
    setAppliedMaxDistance(20);
    setAppliedOpenNowOnly(false);
  };

  // Filter & Sort Logic
  const filteredListings = listings
    .filter(item => {
      // City filter
      if (selectedCity && item.city && item.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
      // Category filter
      if (!appliedCategories.includes(item.category) && appliedCategories.length > 0) return false;
      // Rating filter
      if (appliedMinRating !== null && item.rating < appliedMinRating) return false;
      // Distance filter
      if (item.distance > appliedMaxDistance) return false;
      // Open now filter
      if (appliedOpenNowOnly && item.timing.toLowerCase().includes('close')) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'Highest Rated') {
        return b.rating - a.rating;
      }
      if (sortBy === 'Distance') {
        return a.distance - b.distance;
      }
      // Relevance / Default: Featured first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

  // Dynamically set categories when listings change
  useEffect(() => {
      if (listings.length > 0 && availableCategories.length === 0) {
          const uniqueCategories = Array.from(new Set(listings.map(l => l.category))) as string[];
          setAvailableCategories(uniqueCategories);
          setSelectedCategories(uniqueCategories);
          setAppliedCategories(uniqueCategories);
      }
  }, [listings, availableCategories.length]);


  return (
    <div className="max-w-container-max mx-auto px-xxl py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm font-medium text-secondary">
        <button onClick={handleBack} className="hover:text-primary transition-colors cursor-pointer flex items-center">Home</button>
        <span className="material-symbols-outlined text-base text-secondary/40 select-none flex items-center">chevron_right</span>
        <button onClick={handleBack} className="hover:text-primary transition-colors cursor-pointer flex items-center">Business Directory</button>
        <span className="material-symbols-outlined text-base text-secondary/40 select-none flex items-center">chevron_right</span>
        <span className="text-primary font-bold flex items-center capitalize">{(category || searchQuery || "").replace(/-/g, ' ')}</span>
      </nav>

      {/* Main Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-ink-deep mb-xs capitalize">
          {searchQuery ? `Search Results for "${searchQuery}" in ${selectedCity || 'Jalgaon'}` : `${(category || "").replace(/-/g, ' ')} in ${selectedCity || 'Jalgaon'}`}
        </h1>
        <p className="text-secondary max-w-2xl">
          {searchQuery ? `Showing results for your search query in ${selectedCity || 'Jalgaon'}.` : `Find trusted ${(category || "").replace(/-/g, ' ')} and services near you. Verified listings with reviews and direct contact options.`}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 bg-white rounded-xl p-6 border border-hairline-soft shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-primary">Filters</h2>
            <button onClick={clearFilters} className="text-primary text-xs font-bold hover:underline cursor-pointer">Clear all</button>
          </div>

          {/* Category Filter */}
          {availableCategories.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-ink-deep mb-4 text-sm">Category</h3>
              <div className="space-y-3">
                {availableCategories.map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryChange(cat)}
                      className="w-5 h-5 rounded border-outline text-primary focus:ring-primary cursor-pointer accent-primary" 
                    />
                    <span className="text-sm font-medium text-secondary group-hover:text-primary transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Rating Filter */}
          <div className="mb-8">
            <h3 className="font-bold text-ink-deep mb-4 text-sm">Rating</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setMinRating(minRating === 4 ? null : 4)}
                className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all cursor-pointer ${minRating === 4 ? 'border-primary bg-primary/5 text-primary' : 'border-hairline-soft bg-white hover:border-primary text-secondary'}`}
              >
                <div className="flex items-center gap-xxs">
                  <span className="material-symbols-outlined text-amber-500 fill-amber-500">star</span>
                  <span className="material-symbols-outlined text-amber-500 fill-amber-500">star</span>
                  <span className="material-symbols-outlined text-amber-500 fill-amber-500">star</span>
                  <span className="material-symbols-outlined text-amber-500 fill-amber-500">star</span>
                  <span className="text-xs font-bold ml-1">4+ Stars</span>
                </div>
                <span className="text-xs font-semibold text-secondary/60">(12)</span>
              </button>

              <button 
                onClick={() => setMinRating(minRating === 3 ? null : 3)}
                className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all cursor-pointer ${minRating === 3 ? 'border-primary bg-primary/5 text-primary' : 'border-hairline-soft bg-white hover:border-primary text-secondary'}`}
              >
                <div className="flex items-center gap-xxs">
                  <span className="material-symbols-outlined text-amber-500 fill-amber-500">star</span>
                  <span className="material-symbols-outlined text-amber-500 fill-amber-500">star</span>
                  <span className="material-symbols-outlined text-amber-500 fill-amber-500">star</span>
                  <span className="material-symbols-outlined text-secondary/40">star</span>
                  <span className="text-xs font-bold ml-1">3+ Stars</span>
                </div>
                <span className="text-xs font-semibold text-secondary/60">(28)</span>
              </button>
            </div>
          </div>

          {/* Distance Slider */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-ink-deep text-sm">Distance</h3>
              <span className="text-xs font-bold text-primary">Within {maxDistance} km</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value))}
              className="w-full h-1.5 bg-hairline-soft rounded-lg appearance-none cursor-pointer accent-primary" 
            />
            <div className="flex justify-between mt-2 text-[10px] text-secondary font-medium">
              <span>1 km</span>
              <span>20 km</span>
            </div>
          </div>

          {/* Open Now Toggle */}
          <div className="pt-6 border-t border-hairline-soft">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-sm text-ink-deep">Open Now</span>
              <div className="relative inline-flex items-center">
                <input 
                  type="checkbox" 
                  checked={openNowOnly}
                  onChange={(e) => setOpenNowOnly(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-secondary/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>
          </div>

          <button 
            onClick={applyFilters}
            className="w-full mt-8 bg-primary text-white py-3.5 rounded-full font-bold hover:bg-primary-deep transition-all active:scale-95 cursor-pointer shadow-md"
          >
            Apply Filters
          </button>
        </aside>

        {/* Results Listings */}
        <div className="lg:col-span-9">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-secondary">
              Showing <strong>{filteredListings.length}</strong> results in {selectedCity || 'Jalgaon'}
            </span>
            <div className="flex items-center gap-xs">
              <span className="text-xs text-secondary font-semibold">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer outline-none"
              >
                <option value="Relevance">Relevance</option>
                <option value="Highest Rated">Highest Rated</option>
                <option value="Distance">Distance</option>
              </select>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-hairline-soft p-2 shadow-sm flex flex-col md:flex-row animate-pulse">
                    <div className="md:w-72 h-48 md:h-full min-h-[200px] bg-surface-container-low rounded-lg m-1 shrink-0"></div>
                    <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="h-7 bg-surface-container-low rounded-md w-1/2"></div>
                          <div className="h-6 w-12 bg-surface-container-low rounded-full"></div>
                        </div>
                        <div className="h-4 bg-surface-container-low rounded w-1/4 mb-4"></div>
                        <div className="space-y-3 mb-6">
                          <div className="h-4 bg-surface-container-low rounded w-3/4"></div>
                          <div className="h-4 bg-surface-container-low rounded w-1/2"></div>
                          <div className="h-4 bg-surface-container-low rounded w-1/3"></div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 items-center mt-4 md:mt-0">
                        <div className="h-10 bg-surface-container-low rounded-full flex-1 md:flex-none md:w-32"></div>
                        <div className="h-10 bg-surface-container-low rounded-full flex-1 md:flex-none md:w-32"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white rounded-xl border border-hairline-soft p-8">
                <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
                <h3 className="text-lg font-bold text-ink-deep">{error}</h3>
              </div>
            ) : filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <article 
                  key={listing.id}
                  onClick={() => handleSelect(listing.id, listing.name)}
                  className={`group bg-white rounded-xl border p-2 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row relative cursor-pointer ${
                    listing.featured ? 'border-primary' : 'border-hairline-soft'
                  }`}
                >
                  {listing.featured && (
                    <div className="absolute -top-3 left-6 bg-primary text-white text-[9px] font-bold tracking-widest px-3 py-1 rounded-full uppercase z-10 shadow-sm">
                      Featured
                    </div>
                  )}

                  {/* Image Container */}
                  <div className="md:w-72 h-48 md:h-auto overflow-hidden rounded-lg m-1 relative shrink-0">
                    <img 
                      src={listing.image} 
                      alt={listing.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Info Content */}
                  <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-extrabold text-ink-deep leading-snug group-hover:text-primary transition-colors">
                            {listing.name}
                          </h2>
                          {listing.verified && (
                            <span className="material-symbols-outlined text-primary text-[18px] fill-primary">verified</span>
                          )}
                        </div>
                        <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center">
                          {listing.rating}
                        </div>
                      </div>

                      <p className="text-primary font-bold text-xs uppercase tracking-wider mb-4">
                        {listing.displayCategory}
                      </p>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-xs text-secondary text-sm">
                          <span className="material-symbols-outlined text-secondary/60 text-lg">location_on</span>
                          <span>{listing.address}</span>
                        </div>
                        <div className="flex items-center gap-xs text-secondary text-sm">
                          <span className="material-symbols-outlined text-secondary/60 text-lg">near_me</span>
                          <span>{listing.distance} km from your location</span>
                        </div>
                        <div className="flex items-center gap-xs text-sm">
                          <span className={`material-symbols-outlined text-lg ${listing.timingColor}`}>schedule</span>
                          <span className={`font-bold ${listing.timingColor}`}>{listing.timing}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 items-center">
                      <a 
                        href={`tel:${listing.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 md:flex-none bg-primary hover:bg-primary-deep text-white px-6 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm text-sm"
                      >
                        <span className="material-symbols-outlined text-lg">call</span>
                        Call Now
                      </a>
                      <a 
                        href={`https://wa.me/${listing.phone.replace('+', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 md:flex-none border-2 border-primary text-primary hover:bg-primary/5 px-6 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer text-sm"
                      >
                        <span className="material-symbols-outlined text-lg">chat</span>
                        WhatsApp
                      </a>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelect(listing.id, listing.name); }}
                        className="ml-auto flex items-center gap-1 text-primary text-sm font-bold hover:underline cursor-pointer"
                      >
                        View Profile
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-hairline-soft p-8">
                <span className="material-symbols-outlined text-5xl text-secondary/40 mb-4">search_off</span>
                <h3 className="text-lg font-bold text-ink-deep mb-2">No listings found</h3>
                <p className="text-secondary text-sm mx-auto w-full max-w-[400px]">
                  Try adjusting your filters or category selection to find services in {selectedCity || 'Jalgaon'}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
