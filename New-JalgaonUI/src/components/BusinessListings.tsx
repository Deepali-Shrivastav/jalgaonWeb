"use client";

import React, { useState, useEffect } from "react";
import CarouselAds from "@/components/CarouselAds";
import Pagination from "@/components/Pagination";
import { useLocation } from "@/hooks/useLocation";

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
  image: string;
  phone: string;
  email: string;
  city?: string;
}

import { useRouter } from "next/navigation";

export interface BusinessListingsProps {
  category?: string | null;
  searchQuery?: string | null;
  selectedCity?: string | null;
  onBack?: () => void;
  onSelectListing?: (id: string, name: string) => void;
}

export default function BusinessListings({
  category,
  searchQuery,
  selectedCity,
  onBack,
  onSelectListing,
}: BusinessListingsProps) {
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
      router.push("/");
    }
  };
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Geolocation and Subcategory filtering states
  const { lat, lng, hasLocation, error: locationError, isLoading: isLocationLoading, requestLocation } = useLocation();
  const [radius, setRadius] = useState<number>(10);
  const [subcategories, setSubcategories] = useState<Array<{sub_category: string, slug: string}>>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Interactive filtering states (applied on click of Apply Filters or live-updated)
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [appliedMinRating, setAppliedMinRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        let endpoint = "";
        const categoryParam = selectedCategories.length === 1
          ? `&category=${encodeURIComponent(selectedCategories[0])}`
          : "";

        const subcategoryParam = selectedSubcategory
          ? `&subcategory=${encodeURIComponent(selectedSubcategory)}`
          : "";

        const locationParam = hasLocation && lat && lng
          ? `&lat=${lat}&lng=${lng}&radius=${radius}`
          : "";

        const safeCategory = category ? (() => {
          try {
            return encodeURIComponent(decodeURIComponent(category));
          } catch {
            return encodeURIComponent(category);
          }
        })() : "";

        if (searchQuery) {
          endpoint = `/api/v1/search/?q=${encodeURIComponent(searchQuery)}&page=${page}&sort=${sortBy}${categoryParam}${subcategoryParam}${locationParam}`;
        } else if (category) {
          endpoint = `/api/v1/listings/?category=${safeCategory}&page=${page}&sort=${sortBy}${subcategoryParam}${locationParam}`;
        } else {
          endpoint = `/api/v1/listings/?page=${page}&sort=${sortBy}${categoryParam}${subcategoryParam}${locationParam}`;
        }

        const url = process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`
          : endpoint;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();

        const backendResults = json.results || json.data || json || [];

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        // Map backend fields to frontend interface
        const mappedListings: Listing[] = backendResults.map((item: any) => ({
          id: item.slug || item.id,
          name: item.business_name || "",
          category: item.main_category_name || "",
          displayCategory: item.main_category_name || "",
          rating: parseFloat(item.avg_rating) || 0,
          ratingCount: item.review_count || 0,
          featured: item.is_trending || false,
          verified: item.is_verified || false,
          address: item.business_address || "",
          image: item.business_banner
            ? (item.business_banner.startsWith("http")
              ? item.business_banner
              : `${baseUrl}${item.business_banner.startsWith("/") ? "" : "/"}${item.business_banner}`)
            : "https://via.placeholder.com/400x300?text=No+Image",
          phone: item.business_no || "",
          email: item.business_email || "",
          city: item.city || "Jalgaon",
        }));

        setListings(mappedListings);

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
    fetchListings();
  }, [category, searchQuery, page, sortBy, selectedCategories, selectedSubcategory, hasLocation, lat, lng, radius]);

  useEffect(() => {
    setPage(1);
  }, [category, searchQuery, sortBy]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      const activeCategory = category || (selectedCategories.length === 1 ? selectedCategories[0] : null);
      if (!activeCategory) {
        setSubcategories([]);
        setSelectedSubcategory(null);
        return;
      }
      try {
        const catSlug = activeCategory.toLowerCase().replace(/\s+/g, "-");
        const url = process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/search/subcategories/?category=${encodeURIComponent(catSlug)}`
          : `/api/v1/search/subcategories/?category=${encodeURIComponent(catSlug)}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setSubcategories(json.subcategories || []);
        }
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
      }
    };
    fetchSubcategories();
  }, [category, selectedCategories]);

  const handleCategoryChange = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const applyFilters = () => {
    setAppliedCategories(selectedCategories);
    setAppliedMinRating(minRating);
  };

  const clearFilters = () => {
    setSelectedCategories(availableCategories);
    setMinRating(null);
    setSelectedSubcategory(null);

    setAppliedCategories(availableCategories);
    setAppliedMinRating(null);
  };

  // Filter & Sort Logic
  const filteredListings = listings
    .filter((item) => {
      // City filter
      if (
        selectedCity &&
        item.city &&
        item.city.toLowerCase() !== selectedCity.toLowerCase()
      )
        return false;
      // Category filter (client-side backup when multiple checked)
      if (
        selectedCategories.length > 1 &&
        !selectedCategories.includes(item.category)
      )
        return false;
      // Rating filter
      if (appliedMinRating !== null && item.rating < appliedMinRating)
        return false;
      return true;
    });

  // Dynamically set categories when listings change
  useEffect(() => {
    if (listings.length > 0 && availableCategories.length === 0) {
      const uniqueCategories = Array.from(
        new Set(listings.map((l) => l.category)),
      ) as string[];
      setAvailableCategories(uniqueCategories);
      setSelectedCategories(uniqueCategories);
      setAppliedCategories(uniqueCategories);
    }
  }, [listings, availableCategories.length]);


  return (
    <div className="max-w-container-max mx-auto px-xxl py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm font-medium text-secondary">
        <button
          onClick={handleBack}
          className="hover:text-primary transition-colors cursor-pointer flex items-center"
        >
          Home
        </button>
        <span className="material-symbols-outlined text-base text-secondary/40 select-none flex items-center">
          chevron_right
        </span>
        <button
          onClick={handleBack}
          className="hover:text-primary transition-colors cursor-pointer flex items-center"
        >
          Business Directory
        </button>
        <span className="material-symbols-outlined text-base text-secondary/40 select-none flex items-center">
          chevron_right
        </span>
        <span className="text-primary font-bold flex items-center capitalize">
          {(category || searchQuery || "").replace(/-/g, " ")}
        </span>
      </nav>

      {/* Main Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-ink-deep mb-xs capitalize">
          {searchQuery
            ? `Search Results for "${searchQuery}" in ${selectedCity || "Jalgaon"}`
            : `${(category || "").replace(/-/g, " ")} in ${selectedCity || "Jalgaon"}`}
        </h1>
        <p className="text-secondary max-w-2xl">
          {searchQuery
            ? `Showing results for your search query in ${selectedCity || "Jalgaon"}.`
            : `Find trusted ${(category || "").replace(/-/g, " ")} and services near you. Verified listings with reviews and direct contact options.`}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-2">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full bg-white border border-hairline-soft rounded-xl p-4 flex justify-between items-center text-ink-deep font-bold shadow-sm active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">filter_alt</span>
              Filters
            </div>
            <span 
              className="material-symbols-outlined transition-transform duration-300" 
              style={{ transform: isFilterOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              expand_more
            </span>
          </button>
        </div>

        {/* Sidebar Filters */}
        <aside className={`lg:col-span-3 lg:sticky lg:top-24 bg-white rounded-xl p-6 border border-hairline-soft shadow-sm ${isFilterOpen ? 'block mb-6' : 'hidden lg:block'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-primary">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-primary text-xs font-bold hover:underline cursor-pointer"
            >
              Clear all
            </button>
          </div>

          {/* Location Filter - FR-SRCH-04 */}
          <div className="mb-8 border-b border-hairline-soft pb-6">
            <h3 className="font-bold text-ink-deep mb-4 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">my_location</span>
              Search Nearby
            </h3>
            {!hasLocation ? (
              <button
                type="button"
                onClick={requestLocation}
                disabled={isLocationLoading}
                className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary rounded-full py-2.5 text-xs font-bold hover:bg-primary/5 active:scale-95 transition-all cursor-pointer"
              >
                {isLocationLoading ? 'Detecting Location...' : 'Use My Location'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Location Active
                  </span>
                  <button
                    type="button"
                    onClick={requestLocation}
                    className="text-xs text-secondary hover:text-primary font-bold underline cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-secondary font-semibold mb-2">Distance Radius:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 5, 10, 25].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRadius(r)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                          radius === r
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'border-hairline-soft bg-white text-secondary hover:border-primary'
                        }`}
                      >
                        {r}km
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {locationError && (
              <p className="text-[10px] text-red-500 font-bold mt-2">{locationError}</p>
            )}
          </div>

          {/* Category Filter */}
          {availableCategories.length > 0 && (
            <div className="mb-8 border-b border-hairline-soft pb-6">
              <h3 className="font-bold text-ink-deep mb-4 text-sm">Category</h3>
              <div className="space-y-3">
                {availableCategories.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryChange(cat)}
                      className="w-5 h-5 rounded border-outline text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                    <span className="text-sm font-medium text-secondary group-hover:text-primary transition-colors">
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Subcategory Filter - FR-SRCH-08 */}
          {subcategories.length > 0 && (
            <div className="mb-8 border-b border-hairline-soft pb-6">
              <h3 className="font-bold text-ink-deep mb-4 text-sm">Subcategory</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedSubcategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSubcategory === null
                      ? 'bg-primary/5 text-primary border border-primary/20'
                      : 'text-secondary hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  All Subcategories
                </button>
                {subcategories.map((sub) => (
                  <button
                    key={sub.slug}
                    type="button"
                    onClick={() => setSelectedSubcategory(sub.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedSubcategory === sub.slug
                        ? 'bg-primary/5 text-primary border border-primary/20'
                        : 'text-secondary hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {sub.sub_category}
                  </button>
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
                className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all cursor-pointer ${minRating === 4 ? "border-primary bg-primary/5 text-primary" : "border-hairline-soft bg-white hover:border-primary text-secondary"}`}
              >
                <div className="flex items-center gap-xxs">
                  <span className="material-symbols-outlined text-amber-500 fill-amber-500">
                    star
                  </span>
                  <span className="material-symbols-outlined text-amber-500 fill-amber-500">
                    star
                  </span>
                  <span className="material-symbols-outlined text-amber-500 fill-amber-500">
                    star
                  </span>
                  <span className="material-symbols-outlined text-amber-500 fill-amber-500">
                    star
                  </span>
                  <span className="text-xs font-bold ml-1">4+ Stars</span>
                </div>
                <span className="text-xs font-semibold text-secondary/60">
                  (12)
                </span>
              </button>

              <button
                onClick={() => setMinRating(minRating === 3 ? null : 3)}
                className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all cursor-pointer ${minRating === 3 ? "border-primary bg-primary/5 text-primary" : "border-hairline-soft bg-white hover:border-primary text-secondary"}`}
              >
                <div className="flex items-center gap-xxs">
                  <span className="material-symbols-outlined text-amber-500 fill-amber-500">
                    star
                  </span>
                  <span className="material-symbols-outlined text-amber-500 fill-amber-500">
                    star
                  </span>
                  <span className="material-symbols-outlined text-amber-500 fill-amber-500">
                    star
                  </span>
                  <span className="material-symbols-outlined text-secondary/40">
                    star
                  </span>
                  <span className="text-xs font-bold ml-1">3+ Stars</span>
                </div>
                <span className="text-xs font-semibold text-secondary/60">
                  (28)
                </span>
              </button>
            </div>
          </div>

          <button
            onClick={applyFilters}
            className="w-full mt-8 bg-primary text-white py-3.5 rounded-full font-bold hover:bg-primary-deep transition-all active:scale-95 cursor-pointer shadow-md"
          >
            Apply Filters
          </button>

          <div className="mt-8 flex justify-center w-full">
            <CarouselAds slot="sidebar" className="w-[300px] h-[250px]" />
          </div>
        </aside>

        {/* Results Listings */}
        <div className="lg:col-span-9">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-secondary">
              Showing <strong>{filteredListings.length}</strong> results in{" "}
              {selectedCity || "Jalgaon"}
            </span>
            <div className="flex items-center gap-xs">
              <span className="text-xs text-secondary font-semibold">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="distance" disabled={!hasLocation}>
                  Nearest First{!hasLocation ? " (enable location)" : ""}
                </option>
              </select>
            </div>
          </div>

          {/* Category Filter Chips - FR-SRCH-08 */}
          {availableCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategories(availableCategories);
                  setSelectedSubcategory(null);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  selectedCategories.length === availableCategories.length
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'border-hairline-soft bg-white text-secondary hover:border-primary'
                }`}
              >
                All Categories
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategories([cat]);
                    setSelectedSubcategory(null);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    selectedCategories.length === 1 && selectedCategories[0] === cat
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'border-hairline-soft bg-white text-secondary hover:border-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Subcategory Filter Chips - FR-SRCH-08 */}
          {selectedCategories.length === 1 && subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 bg-slate-50 p-3 rounded-2xl border border-hairline-soft/60">
              <span className="text-xs text-secondary font-bold self-center mr-2">Subcategories:</span>
              <button
                type="button"
                onClick={() => setSelectedSubcategory(null)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                  selectedSubcategory === null
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'border-hairline-soft bg-white text-secondary hover:border-primary'
                }`}
              >
                All
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub.slug}
                  type="button"
                  onClick={() => setSelectedSubcategory(sub.slug)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                    selectedSubcategory === sub.slug
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'border-hairline-soft bg-white text-secondary hover:border-primary'
                  }`}
                >
                  {sub.sub_category}
                </button>
              ))}
            </div>
          )}

          {/* Results List */}
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-hairline-soft p-2 shadow-sm flex flex-col md:flex-row animate-pulse"
                  >
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
                <span className="material-symbols-outlined text-4xl text-red-500 mb-4">
                  error
                </span>
                <h3 className="text-lg font-bold text-ink-deep">{error}</h3>
              </div>
            ) : filteredListings.length > 0 ? (
              filteredListings.map((listing, index) => (
                <React.Fragment key={listing.id}>
                  {index > 0 && index % 5 === 0 && (
                    <div className="my-8 flex justify-center w-full overflow-hidden">
                      <CarouselAds slot="listing_interstitial" className="w-full max-w-[900px] h-[200px]" />
                    </div>
                  )}
                  <article
                    onClick={() => handleSelect(listing.id, listing.name)}
                    className={`group bg-white rounded-xl border p-2 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row relative cursor-pointer ${
                      listing.featured
                        ? "border-primary"
                        : "border-hairline-soft"
                    }`}
                  >
                    {listing.featured && (
                      <div className="absolute -top-3 left-6 bg-primary text-white text-[9px] font-bold tracking-widest px-3 py-1 rounded-full uppercase z-10 shadow-sm">
                        Featured
                      </div>
                    )}

                    {/* Image Container */}
                    <div className="w-[290px] h-[240px] overflow-hidden rounded-lg m-1 relative shrink-0 bg-surface-container-low">
                      <img
                        src={listing.image}
                        alt={listing.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
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
                              <span className="material-symbols-outlined text-primary text-[18px] fill-primary">
                                verified
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-primary font-bold text-xs uppercase tracking-wider mb-4">
                          {listing.displayCategory}
                        </p>

                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-xs text-secondary text-sm">
                            <span className="material-symbols-outlined text-secondary/60 text-lg">
                              location_on
                            </span>
                            <span>{listing.address}</span>
                          </div>
                          {listing.phone && (
                            <div className="flex items-center gap-xs text-secondary text-sm">
                              <span className="material-symbols-outlined text-secondary/60 text-lg">
                                call
                              </span>
                              <span>{listing.phone}</span>
                            </div>
                          )}
                          {listing.email && (
                            <div className="flex items-center gap-xs text-secondary text-sm">
                              <span className="material-symbols-outlined text-secondary/60 text-lg">
                                mail
                              </span>
                              <span>{listing.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 items-center">
                        <a
                          href={`tel:${listing.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 md:flex-none bg-primary hover:bg-primary-deep text-white px-6 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm text-sm"
                        >
                          <span className="material-symbols-outlined text-lg">
                            call
                          </span>
                          Call Now
                        </a>
                        <a
                          href={`https://wa.me/${listing.phone.replace("+", "")}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 md:flex-none border-2 border-primary text-primary hover:bg-primary/5 px-6 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer text-sm"
                        >
                          <span className="material-symbols-outlined text-lg">
                            chat
                          </span>
                          WhatsApp
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(listing.id, listing.name);
                          }}
                          className="ml-auto flex items-center gap-1 text-primary text-sm font-bold hover:underline cursor-pointer"
                        >
                          View Profile
                          <span className="material-symbols-outlined text-base">
                            arrow_forward
                          </span>
                        </button>
                      </div>
                    </div>
                  </article>
                </React.Fragment>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-hairline-soft p-8">
                <span className="material-symbols-outlined text-5xl text-secondary/40 mb-4">
                  search_off
                </span>
                <h3 className="text-lg font-bold text-ink-deep mb-2">
                  No listings found
                </h3>
                <p className="text-secondary text-sm mx-auto w-full max-w-[400px]">
                  Try adjusting your filters or category selection to find
                  services in {selectedCity || "Jalgaon"}.
                </p>
              </div>
            )}
          </div>
          
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        </div>
      </div>
    </div>
  );
}
