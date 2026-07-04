'use client';
import React, { useEffect, useState } from 'react';

interface Ad {
  id: number;
  ad_image: string;
  name: string;
  target_page: string;
}

export default function CarouselAds({ slot = 'hero_banner' }: { slot?: string }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/v1/ads/by-slot/?slot=${slot}`);
        if (res.ok) {
          const data = await res.json();
          if (data.is_enabled && data.ads) {
            setAds(data.ads);
          }
        }
      } catch (err) {
        console.error('Failed to fetch ads:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [slot]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads]);

  const handleAdClick = (adId: number) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${baseUrl}/api/v1/ads/${adId}/track-click/`, { method: 'POST' }).catch(console.error);
  };

  useEffect(() => {
    if (ads.length > 0) {
      const currentAd = ads[currentIndex];
      if (currentAd) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        fetch(`${baseUrl}/api/v1/ads/${currentAd.id}/track-impression/`, { method: 'POST' }).catch(console.error);
      }
    }
  }, [currentIndex, ads]);

  if (loading || ads.length === 0) return null;

  return (
    <div className="relative w-full max-w-container-max mx-auto px-base overflow-hidden rounded-xl my-6 group">
      <div 
        className="flex transition-transform duration-500 ease-in-out" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {ads.map((ad, index) => (
          <div key={ad.id} className="min-w-full flex-shrink-0 cursor-pointer" onClick={() => handleAdClick(ad.id)}>
            <img
              src={ad.ad_image.startsWith('http') ? ad.ad_image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${ad.ad_image}`}
              alt={ad.name || 'Advertisement'}
              className="w-full h-auto max-h-[400px] object-cover rounded-xl"
            />
          </div>
        ))}
      </div>
      
      {ads.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full transition-colors ${idx === currentIndex ? 'bg-primary' : 'bg-white/50'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Optional: Add navigation arrows on hover */}
      {ads.length > 1 && (
        <>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous ad"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev + 1) % ads.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next ad"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </>
      )}
    </div>
  );
}
