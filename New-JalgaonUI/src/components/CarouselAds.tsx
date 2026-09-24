'use client';
import React from 'react';
import BannerCarousel from '@/components/BannerCarousel';

export default function CarouselAds({
  slot = 'hero_banner',
  className = '',
  categorySlug,
  businessSlug,
}: {
  slot?: string;
  className?: string;
  categorySlug?: string | null;
  businessSlug?: string | null;
}) {
  return (
    <BannerCarousel
      slot={slot}
      className={className}
      categorySlug={categorySlug}
      businessSlug={businessSlug}
    />
  );
}
