'use client';

import React from 'react';
import BannerCarousel from '@/components/BannerCarousel';
import HomeSearchSection from '@/components/HomeSearchSection';

interface HeroProps {
  selectedCity?: string;
  onCityChange?: (city: string) => void;
  onSearch?: (query: string) => void;
}

export default function Hero({
  selectedCity = 'Jalgaon',
  onCityChange,
  onSearch
}: HeroProps) {
  return (
    <section className="hero-radial-bg pb-5 sm:pb-12 relative overflow-hidden pt-1 sm:pt-4" data-purpose="hero-search-area">
      {/* Featured Promotional Banner Grid (8-col main carousel + 4-col stacked banners) */}
      <BannerCarousel slot="hero_banner" placement="home" />

      {/* Rounded Search Bar & Action Buttons */}
      <HomeSearchSection
        selectedCity={selectedCity}
        onCityChange={onCityChange}
        onSearch={onSearch}
      />
    </section>
  );
}
