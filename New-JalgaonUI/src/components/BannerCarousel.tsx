'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Building2, Paintbrush, Leaf, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { BannerItem, BannerCarouselProps, BannerFeatureBlock } from '@/types/banner';

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 'default-1',
    title: 'Discover Historic Jalgaon & Ajanta Gateway',
    subtitle: 'Explore ancient forts, heritage temples, and natural wonders across the region.',
    ctaText: 'Explore Tourism',
    ctaUrl: '/tourism',
    badgeText: 'LOCAL HERITAGE',
    bannerType: 'promotional',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'default-2',
    title: 'Jalgaon Gold City Shopping Festival',
    subtitle: 'Discover trusted jewellers, festive discounts, and premier local retail outlets.',
    ctaText: 'Browse Gold & Retail',
    ctaUrl: '/category/retail',
    badgeText: 'GOLD CITY SPECIAL',
    bannerType: 'offer',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'default-3',
    title: 'Agri-Tech & Business Expo 2026',
    subtitle: 'Join leading regional enterprise leaders, agricultural innovators, and startups.',
    ctaText: 'View Event Details',
    ctaUrl: '/events',
    badgeText: 'UPCOMING EXPO',
    bannerType: 'event',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'default-4',
    title: 'Authentic Khandeshi Food & Dining Trail',
    subtitle: 'Taste traditional delicacies and discover top-rated local cafes and restaurants.',
    ctaText: 'Find Restaurants',
    ctaUrl: '/category/food-and-beverages',
    badgeText: 'FOOD SPOTLIGHT',
    bannerType: 'category',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'default-5',
    title: 'Connect With 5,000+ Verified Businesses',
    subtitle: 'Find verified automotive, home, healthcare, and professional services near you.',
    ctaText: 'Explore Directory',
    ctaUrl: '/category/business-services',
    badgeText: 'SMART JALGAON',
    bannerType: 'business',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
  },
];

const DEFAULT_FEATURE_BLOCKS: BannerFeatureBlock[] = [
  {
    id: 'block-1',
    iconName: 'Building2',
    title: 'Architectural Design',
    description: 'Short supporting text here...',
  },
  {
    id: 'block-2',
    iconName: 'Paintbrush',
    title: 'Interior Styling',
    description: 'Short supporting text here...',
  },
  {
    id: 'block-3',
    iconName: 'Leaf',
    title: 'Sustainable Consulting',
    description: 'Short supporting text here...',
  },
];

const renderIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Building2':
      return <Building2 className="w-5 h-5 text-primary" />;
    case 'Paintbrush':
      return <Paintbrush className="w-5 h-5 text-primary" />;
    case 'Leaf':
      return <Leaf className="w-5 h-5 text-primary" />;
    case 'ShieldCheck':
      return <ShieldCheck className="w-5 h-5 text-primary" />;
    case 'Sparkles':
      return <Sparkles className="w-5 h-5 text-primary" />;
    default:
      return <Award className="w-5 h-5 text-primary" />;
  }
};

export default function BannerCarousel({
  banners: customBanners,
  featureBlocks: customFeatureBlocks,
  slot = 'hero_banner',
  placement = 'home',
  categorySlug,
  businessSlug,
  autoplay = true,
  autoplayInterval = 5000,
  showArrows = true,
  showDots = true,
  variant = 'hero',
  className = '',
}: BannerCarouselProps) {
  const [banners, setBanners] = useState<BannerItem[]>(customBanners || []);
  const [loading, setLoading] = useState<boolean>(!customBanners);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const activeFeatureBlocks = customFeatureBlocks && customFeatureBlocks.length > 0 ? customFeatureBlocks : DEFAULT_FEATURE_BLOCKS;

  // Fetch banners if not provided manually
  useEffect(() => {
    if (customBanners && customBanners.length > 0) {
      setBanners(customBanners);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchBanners = async () => {
      try {
        // Try fetching dedicated active client banners first
        const bannerRes = await fetch(`${baseUrl}/api/v1/banners/active/`);
        if (bannerRes.ok) {
          const bannerData = await bannerRes.json();
          if (Array.isArray(bannerData.banners) && bannerData.banners.length > 0) {
            const mappedBanners: BannerItem[] = bannerData.banners.map((b: any) => {
              const fullImg = b.banner_image?.startsWith('http')
                ? b.banner_image
                : `${baseUrl.replace(/\/$/, '')}${b.banner_image?.startsWith('/') ? '' : '/'}${b.banner_image}`;
              return {
                id: b.id,
                clientName: b.client_name,
                websiteUrl: b.website_url,
                title: b.title || '',
                subtitle: b.subtitle || '',
                image: fullImg,
                ctaText: b.cta_text || 'Explore Now',
                ctaUrl: b.website_url || '#',
                badgeText: b.badge_text || '',
                bannerType: 'promotional',
                isBannerModel: true,
              } as BannerItem & { isBannerModel?: boolean };
            });
            if (isMounted) {
              setBanners(mappedBanners);
              setLoading(false);
              return;
            }
          }
        }

        // Fallback to slot-based ad listings if no dedicated active banners
        let endpoint = `${baseUrl}/api/v1/ads/by-slot/?slot=${encodeURIComponent(slot)}`;
        if (categorySlug) {
          endpoint += `&category=${encodeURIComponent(categorySlug)}`;
        }
        if (businessSlug) {
          endpoint += `&business=${encodeURIComponent(businessSlug)}`;
        }

        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (data.is_enabled && Array.isArray(data.ads) && data.ads.length > 0) {
            const mapped: BannerItem[] = data.ads.map((ad: any) => {
              const fullImg = ad.ad_image?.startsWith('http')
                ? ad.ad_image
                : `${baseUrl.replace(/\/$/, '')}${ad.ad_image?.startsWith('/') ? '' : '/'}${ad.ad_image}`;
              return {
                id: ad.id,
                title: ad.title || ad.name || 'Featured Promotion',
                subtitle: ad.subtitle || ad.description || '',
                image: fullImg,
                ctaText: ad.cta_text || 'Learn More',
                ctaUrl: ad.cta_url || ad.target_page_url || (ad.shop_listing ? `/category/detail/${ad.shop_listing}` : '#'),
                badgeText: ad.badge_text || (ad.ad_type === 'BA' ? 'PROMOTION' : 'FEATURED'),
                bannerType: ad.banner_type || 'promotional',
                shopListingId: ad.shop_listing,
              };
            });
            if (isMounted) setBanners(mapped);
          } else {
            if (isMounted) setBanners(DEFAULT_BANNERS);
          }
        } else {
          if (isMounted) setBanners(DEFAULT_BANNERS);
        }
      } catch (err) {
        console.warn('Failed to fetch banner ads, falling back to default banners:', err);
        if (isMounted) setBanners(DEFAULT_BANNERS);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBanners();
    return () => {
      isMounted = false;
    };
  }, [customBanners, slot, categorySlug, businessSlug, baseUrl]);

  const handleNext = useCallback(() => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const handlePrev = useCallback(() => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Pause autoplay on user interaction and resume after delay
  const triggerUserInteractionPause = useCallback(() => {
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4000);
  }, []);

  // Autoplay effect
  useEffect(() => {
    if (!autoplay || isPaused || banners.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [autoplay, isPaused, banners.length, autoplayInterval, handleNext]);

  // Cleanup pause timer
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  // Compute sliding window of max 5 dots for clean display regardless of total banners count
  const getVisibleDots = () => {
    const totalBanners = banners.length;
    const MAX_VISIBLE_DOTS = 5;

    if (totalBanners <= MAX_VISIBLE_DOTS) {
      return Array.from({ length: totalBanners }, (_, i) => i);
    }

    let start = Math.max(0, currentIndex - Math.floor(MAX_VISIBLE_DOTS / 2));
    if (start + MAX_VISIBLE_DOTS > totalBanners) {
      start = totalBanners - MAX_VISIBLE_DOTS;
    }
    return Array.from({ length: MAX_VISIBLE_DOTS }, (_, i) => start + i);
  };

  // Track impression when slide changes
  useEffect(() => {
    if (banners.length > 0 && banners[currentIndex]?.id) {
      const currentBanner = banners[currentIndex];
      if (typeof currentBanner.id === 'number') {
        fetch(`${baseUrl}/api/v1/ads/${currentBanner.id}/track-impression/`, { method: 'POST' }).catch(() => { });
      }
    }
  }, [currentIndex, banners, baseUrl]);

  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);

  const handleBannerClick = (banner: BannerItem, e?: React.MouseEvent) => {
    if (e && isSwiping) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (typeof banner?.id === 'number') {
      const isDedicatedBanner = (banner as any).isBannerModel || banner.websiteUrl;
      const trackUrl = isDedicatedBanner
        ? `${baseUrl}/api/v1/banners/${banner.id}/track-click/`
        : `${baseUrl}/api/v1/ads/${banner.id}/track-click/`;

      fetch(trackUrl, { method: 'POST' }).catch(() => { });
    }
  };

  // Touch & Mouse Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchStartXRef.current = clientX;
    touchEndXRef.current = clientX;
    isDraggingRef.current = true;
    setIsSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingRef.current || touchStartXRef.current === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchEndXRef.current = clientX;
    if (Math.abs(touchStartXRef.current - clientX) > 10) {
      setIsSwiping(true);
    }
  };

  const handleTouchEnd = () => {
    if (isDraggingRef.current && touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const distance = touchStartXRef.current - touchEndXRef.current;
      const minSwipeDistance = 35;

      if (Math.abs(distance) > minSwipeDistance) {
        triggerUserInteractionPause();
        if (distance > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    isDraggingRef.current = false;
    touchStartXRef.current = null;
    touchEndXRef.current = null;
    setTimeout(() => setIsSwiping(false), 100);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      triggerUserInteractionPause();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      triggerUserInteractionPause();
      handleNext();
    }
  };

  const isSidebar = slot === 'sidebar' || variant === 'compact' || variant === 'card' || placement === 'sidebar';

  if (loading) {
    return (
      <div className={isSidebar ? `w-full ${className}` : `w-full max-w-7xl mx-auto px-4 md:px-6 my-6 ${className}`}>
        <div className={`w-full bg-surface-container-low animate-pulse rounded-2xl md:rounded-3xl border border-hairline-soft ${isSidebar ? 'h-[320px]' : 'aspect-[21/9] md:aspect-[21/8]'}`} />
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div
      className={isSidebar ? `w-full overflow-hidden ${className}` : `w-full max-w-7xl mx-auto px-3 sm:px-4 my-4 sm:my-8 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Promotional Banners"
    >
      {isSidebar ? (
        /* BANNER IMAGE CONTAINER FOR SIDEBAR */
        <div
          className="relative w-full rounded-xl overflow-hidden shadow-xs border border-slate-200/80 bg-white group touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-700 ease-out h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {banners.map((banner, index) => {
              const targetUrl = banner.ctaUrl || banner.websiteUrl || '#';
              const isExternal = targetUrl.startsWith('http');
              const displayTitle = banner.title || banner.clientName || 'Featured Banner';

              return (
                <a
                  key={banner.id || index}
                  href={targetUrl}
                  target={isExternal ? '_blank' : '_self'}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  onClick={(e) => handleBannerClick(banner, e)}
                  className="relative w-full flex-shrink-0 group/slide cursor-pointer overflow-hidden block h-auto"
                >
                  <div className="relative w-full h-auto rounded-xl overflow-hidden bg-white">
                    <img
                      src={banner.image}
                      alt={displayTitle}
                      className="w-full h-auto object-cover rounded-xl block transition-transform duration-300 group-hover/side:scale-[1.01]"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80';
                      }}
                    />
                  </div>
                </a>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          {showArrows && banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => {
                  triggerUserInteractionPause();
                  handlePrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-800 border border-slate-200 flex items-center justify-center shadow-xs cursor-pointer"
                aria-label="Previous Slide"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerUserInteractionPause();
                  handleNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-800 border border-slate-200 flex items-center justify-center shadow-xs cursor-pointer"
                aria-label="Next Slide"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </>
          )}

          {/* Pagination Dots (Capped to max 5 visible dots) */}
          {showDots && banners.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full">
              {getVisibleDots().map((slideIdx) => (
                <button
                  key={slideIdx}
                  type="button"
                  onClick={() => {
                    triggerUserInteractionPause();
                    setCurrentIndex(slideIdx);
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    slideIdx === currentIndex ? 'w-5 h-2 bg-primary' : 'w-2 h-2 bg-white/70'
                  }`}
                  aria-label={`Go to slide ${slideIdx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* HOMEPAGE FEATURED BANNER SECTION CONTAINER BOX */
        <div className="w-full max-w-5xl mx-auto px-0 pt-1 pb-2">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-3 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-stretch">

              {/* Main Moving Banner Carousel (Full width on mobile, 8 cols on desktop) */}
              <div className="w-full md:col-span-8 flex flex-col justify-center">
                <div
                  className="relative group rounded-xl md:rounded-lg overflow-hidden border border-slate-200/70 shadow-2xs bg-slate-50 flex-1 flex flex-col touch-pan-y select-none cursor-grab active:cursor-grabbing"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleTouchStart}
                  onMouseMove={handleTouchMove}
                  onMouseUp={handleTouchEnd}
                  onMouseLeave={handleTouchEnd}
                >
                  <div className="relative w-full aspect-[16/9] sm:aspect-[2.35/1] md:aspect-auto h-full flex items-center justify-center bg-white overflow-hidden rounded-xl md:rounded-lg">
                    <div
                      className="flex transition-transform duration-700 ease-out w-full h-full"
                      style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                      {banners.map((banner, index) => {
                        const targetUrl = banner.ctaUrl || banner.websiteUrl || '#';
                        const isExternal = targetUrl.startsWith('http');
                        const displayTitle = banner.title || banner.clientName || 'Featured Banner';

                        return (
                          <a
                            key={banner.id || index}
                            href={targetUrl}
                            target={isExternal ? '_blank' : '_self'}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                            onClick={(e) => handleBannerClick(banner, e)}
                            className="relative w-full h-full flex-shrink-0 group/slide cursor-pointer overflow-hidden block outline-none"
                          >
                            <img
                              src={banner.image}
                              alt={displayTitle}
                              className="w-full h-full object-cover transition duration-500 group-hover/slide:scale-[1.01] rounded-xl md:rounded-lg pointer-events-none"
                              loading={index === 0 ? 'eager' : 'lazy'}
                              onError={(e) => {
                                e.currentTarget.src =
                                  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80';
                              }}
                            />
                          </a>
                        );
                      })}
                    </div>

                    {/* Navigation Arrows (Visible on both Mobile & Desktop) */}
                    {showArrows && banners.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerUserInteractionPause();
                            handlePrev();
                          }}
                          className="flex absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-sm text-white items-center justify-center transition-all duration-200 shadow-md cursor-pointer border border-white/20 active:scale-95"
                          aria-label="Previous slide"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">chevron_left</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerUserInteractionPause();
                            handleNext();
                          }}
                          className="flex absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-sm text-white items-center justify-center transition-all duration-200 shadow-md cursor-pointer border border-white/20 active:scale-95"
                          aria-label="Next slide"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">chevron_right</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Sleek Pagination Dots (Capped to max 5 visible dots) */}
                {showDots && banners.length > 1 && (
                  <div className="flex items-center justify-center mt-2.5 gap-1.5">
                    {getVisibleDots().map((slideIdx) => (
                      <button
                        key={slideIdx}
                        type="button"
                        onClick={() => {
                          triggerUserInteractionPause();
                          setCurrentIndex(slideIdx);
                        }}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                          slideIdx === currentIndex ? 'w-5 h-1.5 bg-[#0099e6]' : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                        }`}
                        aria-label={`Go to slide ${slideIdx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right 4-Column Two Stacked Banners (Desktop view only, hidden on mobile for clean moving banner display) */}
              <div className="hidden md:flex md:col-span-4 flex-col gap-3 sm:gap-4 justify-between">
                <div className="flex-1 flex flex-col justify-center">
                  <a
                    className="group relative rounded-lg md:rounded-xl overflow-hidden border border-slate-200/90 shadow-xs block h-full flex items-center justify-center bg-slate-50"
                    href={banners[1]?.ctaUrl || banners[1]?.websiteUrl || '#'}
                    onClick={(e) => banners[1] && handleBannerClick(banners[1], e)}
                  >
                    <img
                      alt={banners[1]?.title || 'Commercial Bank Company Profile'}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105 rounded-lg md:rounded-xl aspect-[16/9] md:aspect-auto"
                      src={
                        banners[1]?.image ||
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuD2AGHNPUTtllN9rcK7DYSn2AvuRAyiYa7S2MKf6GNg7XyrqhxVblYjojO1v95aLKctSenuuAaIwjP2Cze3ZCccdBWv53yCxbWOs190VgRQBu9MOhfmCIL2wU9ilG4ifvXLKaoG7_qMS0WuH6pRI_21Z_LGUAoIscpngdtre7i_gejACrDJ1Ln3kOU-loFlFB4GDgUjgQpO5kVE6igZGKkcvyFYIUoXLLzHzA0PSHfY68YoIZ0Ii8xzLU44_Fg3WwYLxQ'
                      }
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuD2AGHNPUTtllN9rcK7DYSn2AvuRAyiYa7S2MKf6GNg7XyrqhxVblYjojO1v95aLKctSenuuAaIwjP2Cze3ZCccdBWv53yCxbWOs190VgRQBu9MOhfmCIL2wU9ilG4ifvXLKaoG7_qMS0WuH6pRI_21Z_LGUAoIscpngdtre7i_gejACrDJ1Ln3kOU-loFlFB4GDgUjgQpO5kVE6igZGKkcvyFYIUoXLLzHzA0PSHfY68YoIZ0Ii8xzLU44_Fg3WwYLxQ';
                      }}
                    />
                  </a>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <a
                    className="group relative rounded-lg md:rounded-xl overflow-hidden border border-slate-200/90 shadow-xs block h-full flex items-center justify-center bg-slate-50"
                    href={banners[2]?.ctaUrl || banners[2]?.websiteUrl || '#'}
                    onClick={(e) => banners[2] && handleBannerClick(banners[2], e)}
                  >
                    <img
                      alt={banners[2]?.title || 'Promotional Banner'}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105 rounded-lg md:rounded-xl aspect-[16/9] md:aspect-auto"
                      src={
                        banners[2]?.image ||
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuBAARjqzmLM0msrYAdSFSUu2ApV6CqR93YQ_5EYsv5zosDuLT_qz1f5aNjSbFI7yj6Popdc798qKis7KBIc7bib-XY1M74Dbz2E9_ETJeWexWnzj9rQ4zzCwp_ow6UUcO-AjV-F2uUC1jxjgxuO5ioeDHhlVoNMKuk7N8uUGVvKrxWXsPO9QykOvj1caKxDPU-YY3QE4u7gDxHsMrjqtCKBY1-Rd5J8_7uzdGB0PNF3EGWNGekBEXjmpcJrAV05miiYGQ'
                      }
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuBAARjqzmLM0msrYAdSFSUu2ApV6CqR93YQ_5EYsv5zosDuLT_qz1f5aNjSbFI7yj6Popdc798qKis7KBIc7bib-XY1M74Dbz2E9_ETJeWexWnzj9rQ4zzCwp_ow6UUcO-AjV-F2uUC1jxjgxuO5ioeDHhlVoNMKuk7N8uUGVvKrxWXsPO9QykOvj1caKxDPU-YY3QE4u7gDxHsMrjqtCKBY1-Rd5J8_7uzdGB0PNF3EGWNGekBEXjmpcJrAV05miiYGQ';
                      }}
                    />
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

