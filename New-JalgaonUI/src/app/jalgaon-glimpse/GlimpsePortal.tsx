'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SkeletonCard from '@/components/SkeletonCard';
import { YouTubeVideo, YouTubeVideoListResponse } from '@/types/youtube';

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).toLowerCase();
  } catch {
    return isoString;
  }
}

function formatNumber(numStr?: string): string {
  if (!numStr) return '0';
  const num = parseInt(numStr, 10);
  if (isNaN(num)) return numStr;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return `${num}`;
}

function getHighResThumbnail(video?: YouTubeVideo | null): string {
  if (!video) return 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200';
  if (video.thumbnail_url && !video.thumbnail_url.includes('hqdefault.jpg') && !video.thumbnail_url.includes('mqdefault.jpg') && !video.thumbnail_url.includes('sddefault.jpg') && !video.thumbnail_url.includes('default.jpg')) {
    return video.thumbnail_url;
  }
  if (video.video_id) {
    return `https://i.ytimg.com/vi/${video.video_id}/maxresdefault.jpg`;
  }
  return video.thumbnail_url || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200';
}

const DEMO_PODCASTS: YouTubeVideo[] = [
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'jalgaon business podcast, ep 01: economic growth and trade secrets',
    description: 'in-depth conversation on jalgaon’s gold markets, agricultural exports, and business ecosystem.',
    thumbnail_url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800',
    published_at: '2024-10-24T10:00:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 3238,
    is_short: false,
    view_count: '53000000',
  },
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'banana capital agriculture podcast, ep 02: farming innovations',
    description: 'interviews with progressive jalgaon farmers pioneering modern banana cultivation and exports.',
    thumbnail_url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=800',
    published_at: '2024-10-18T14:30:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 1859,
    is_short: false,
    view_count: '716000',
  },
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'gold city podcast, ep 03: inside jalgaon jewellery crafting',
    description: 'conversations with master goldsmiths and trade leaders in jalgaon’s legendary bullion market.',
    thumbnail_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800',
    published_at: '2024-10-15T09:15:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 2140,
    is_short: false,
    view_count: '240000',
  },
];

const DEMO_SHORTS: YouTubeVideo[] = [
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'trade secrets in 60 seconds',
    description: 'Quick insights from Jalgaon business leaders.',
    thumbnail_url: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=600',
    published_at: '2024-10-22T08:00:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 52,
    is_short: true,
    view_count: '12000',
  },
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'banana farming hacks',
    description: 'Smart irrigation and harvest tips.',
    thumbnail_url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=600',
    published_at: '2024-10-21T08:00:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 38,
    is_short: true,
    view_count: '8400',
  },
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'inside a gold workshop',
    description: 'Crafting fine ornaments in Jalgaon.',
    thumbnail_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600',
    published_at: '2024-10-20T08:00:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 47,
    is_short: true,
    view_count: '21000',
  },
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'ajanta caves in 60 sec',
    description: 'Ancient rock-cut heritage tour.',
    thumbnail_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600',
    published_at: '2024-10-19T08:00:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 45,
    is_short: true,
    view_count: '15000',
  },
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'boat ride on girna river',
    description: 'Scenic views of Girna river in Jalgaon.',
    thumbnail_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600',
    published_at: '2024-10-18T08:00:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 33,
    is_short: true,
    view_count: '6100',
  },
];

interface GlimpsePortalProps {
  initialData?: YouTubeVideoListResponse | null;
}

export default function GlimpsePortal({ initialData }: GlimpsePortalProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>(
    initialData?.results && initialData.results.length > 0 ? initialData.results : DEMO_PODCASTS
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [activeShortIndex, setActiveShortIndex] = useState<number | null>(null);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = `${baseUrl}/api/v1/jalgaon-glimpse/videos/?max_results=12`;
      const res = await fetch(url);

      if (!res.ok) {
        setVideos(DEMO_PODCASTS);
        return;
      }

      const data: YouTubeVideoListResponse = await res.json();
      if (data.results && data.results.length > 0) {
        setVideos(data.results);
      } else {
        setVideos(DEMO_PODCASTS);
      }
    } catch {
      setVideos(DEMO_PODCASTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData || !initialData.results || initialData.results.length === 0) {
      fetchVideos();
    }
  }, []);

  const podcastList = videos.filter((v) => !v.is_short);
  const displayPodcasts = podcastList.length > 0 ? podcastList : DEMO_PODCASTS;
  const featuredHero = displayPodcasts[0] || videos[0] || DEMO_PODCASTS[0];

  const apiShorts = videos.filter((v) => v.is_short);
  const displayShorts = apiShorts.length > 0 ? apiShorts : DEMO_SHORTS;

  const currentShort = activeShortIndex !== null ? displayShorts[activeShortIndex] : null;

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low text-ink-deep font-sans antialiased">
      <Header />

      <main className="flex-grow max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-8 space-y-12">
        {/* SECTION 1: HERO FEATURED EPISODE PLAYER BANNER (WIDESCREEN PODCAST) */}
        <div className="relative w-full max-w-[1340px] mx-auto rounded-xl sm:rounded-3xl overflow-hidden shadow-lg bg-slate-950 aspect-video sm:aspect-[21/9] border border-hairline-soft group">
          <img
            src={getHighResThumbnail(featuredHero)}
            alt={featuredHero.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-100"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          {/* Play Icon */}
          <Link
            href={`/jalgaon-glimpse/${featuredHero.video_id}`}
            aria-label={`Play ${featuredHero.title}`}
            className="absolute inset-0 flex items-center justify-center z-10 p-2"
          >
            <div className="w-10 h-10 sm:w-20 sm:h-20 bg-[#0081C7]/90 backdrop-blur-md hover:bg-[#0081C7] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,129,199,0.7)] group-hover:scale-110 transition-all duration-300 -translate-y-2 sm:translate-y-0">
              <span className="material-symbols-outlined text-xl sm:text-5xl translate-x-0.5 fill-current">
                play_arrow
              </span>
            </div>
          </Link>

          {/* Bottom Title Overlay */}
          <div className="absolute bottom-2.5 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 z-10 space-y-1 sm:space-y-2 pointer-events-none">
            <span className="inline-block bg-[#0081C7] text-white text-[9px] sm:text-[11px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-3.5 sm:py-1 rounded-full shadow-sm">
              featured episode
            </span>
            <h1 className="text-xs sm:text-xl md:text-3xl font-bold sm:font-black text-white leading-tight drop-shadow-md capitalize line-clamp-2 sm:line-clamp-3">
              {featuredHero.title}
            </h1>
          </div>
        </div>

        {/* SECTION 2: DON'T MISS OUT / TRENDING PODCAST EPISODES (WIDESCREEN 16:9 GRID) */}
        <div className="space-y-6 max-w-[1340px] mx-auto pt-2">
          <div className="border-b border-hairline-soft pb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#0081C7] block mb-1">
              don't miss out
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-ink-deep tracking-tight capitalize">
              trending episodes
            </h2>
          </div>

          {/* 3 Columns Podcast Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayPodcasts.map((podcast, idx) => (
              <Link
                key={`podcast-${podcast.video_id}-${idx}`}
                href={`/jalgaon-glimpse/${podcast.video_id}`}
                className="group flex flex-col justify-between bg-white border border-hairline-soft rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300"
              >
                {/* Widescreen Thumbnail with Duration Badge */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={podcast.thumbnail_url}
                    alt={podcast.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-[#0081C7] text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <span className="material-symbols-outlined text-2xl translate-x-0.5 fill-current">
                        play_arrow
                      </span>
                    </div>
                  </div>

                  {!!podcast.duration_seconds && podcast.duration_seconds > 0 && (
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/85 text-white text-[11px] font-sans font-extrabold tracking-tight rounded-md backdrop-blur-sm shadow-sm">
                      {formatDuration(podcast.duration_seconds)}
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-ink-deep group-hover:text-[#0081C7] transition-colors line-clamp-2 leading-snug">
                      {podcast.title}
                    </h3>
                    <p className="text-secondary text-xs line-clamp-2 leading-relaxed">
                      {podcast.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-secondary pt-3 border-t border-hairline-soft">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="material-symbols-outlined text-sm text-outline">calendar_today</span>
                      {formatDate(podcast.published_at || '')}
                    </span>
                    <span className="text-[#0081C7] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      watch <span className="text-xs">&rarr;</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* SECTION 3: QUICK BITES / YT SHORTS (PLAYS DIRECTLY IN SHORTS SECTION) */}
        <div id="shorts-section" className="space-y-6 max-w-[1340px] mx-auto pt-6 scroll-mt-24">
          <div className="flex items-end justify-between border-b border-hairline-soft pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#0081C7] block mb-1">
                quick bites
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-ink-deep tracking-tight capitalize">
                shorts
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setActiveShortIndex(0)}
              className="text-xs font-bold text-[#0081C7] hover:underline flex items-center gap-1"
            >
              play all shorts ⚡ &rarr;
            </button>
          </div>

          {/* 5 Vertical Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayShorts.map((short, idx) => (
              <div
                key={`short-${short.video_id}-${idx}`}
                onClick={() => setActiveShortIndex(idx)}
                className="group flex flex-col justify-between bg-white border border-hairline-soft rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Vertical 9:16 Image Container */}
                <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden">
                  <img
                    src={short.thumbnail_url}
                    alt={short.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  {/* Brand Blue Shorts Badge */}
                  <div className="absolute top-2.5 left-2.5 bg-[#0081C7] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <span>⚡</span>
                    <span>Shorts</span>
                  </div>

                  {/* Centered Play Disc */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-[#0081C7] text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-xl translate-x-0.5 fill-current">
                        play_arrow
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Details Container */}
                <div className="p-3 flex-grow flex flex-col justify-between space-y-2">
                  <h3 className="text-xs font-bold text-ink-deep group-hover:text-[#0081C7] transition-colors line-clamp-2 leading-snug">
                    {short.title}
                  </h3>

                  <div className="flex items-center gap-3 text-[11px] text-secondary font-medium pt-1">
                    <span className="flex items-center gap-1">
                      👁 {formatNumber(short.view_count)}
                    </span>
                    <span>
                      {formatDuration(short.duration_seconds || 45)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* --- INLINE SHORTS REEL MODAL PLAYER (PLAYS DIRECTLY IN SHORTS SECTION) --- */}
      {currentShort && activeShortIndex !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative flex flex-col items-center max-w-full max-h-[90vh]">
            
            {/* Modal Header Controls */}
            <div className="w-full max-w-[420px] flex items-center justify-between px-2 mb-3 text-white">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#0081C7] animate-pulse" />
                <span className="text-sky-300">⚡ Jalgaon Shorts ({activeShortIndex + 1}/{displayShorts.length})</span>
              </div>

              <button
                type="button"
                onClick={() => setActiveShortIndex(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
                aria-label="Close shorts player"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Vertical 9:16 Shorts Player Stage with Navigation */}
            <div className="relative flex items-center gap-3 sm:gap-5">
              
              {/* Prev Short Arrow */}
              <button
                type="button"
                onClick={() => setActiveShortIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : displayShorts.length - 1))}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-[#0081C7] text-white flex items-center justify-center shadow-lg transition-all"
                aria-label="Previous short"
              >
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
              </button>

              {/* 9:16 Video Frame */}
              <div className="relative aspect-[9/16] w-[320px] sm:w-[380px] h-[65vh] max-h-[680px] rounded-3xl overflow-hidden bg-black shadow-2xl border-2 border-white/20">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${currentShort.video_id}?autoplay=1&rel=0&modestbranding=1`}
                  title={currentShort.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              {/* Next Short Arrow */}
              <button
                type="button"
                onClick={() => setActiveShortIndex((prev) => (prev !== null && prev < displayShorts.length - 1 ? prev + 1 : 0))}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-[#0081C7] text-white flex items-center justify-center shadow-lg transition-all"
                aria-label="Next short"
              >
                <span className="material-symbols-outlined text-2xl">arrow_forward</span>
              </button>
            </div>

            {/* Bottom Title & Details */}
            <div className="w-full max-w-[420px] mt-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white text-xs space-y-1">
              <h3 className="font-bold text-sm text-white line-clamp-2">
                {currentShort.title}
              </h3>
              <div className="flex items-center justify-between text-white/70 text-[11px] pt-1">
                <span>👁 {formatNumber(currentShort.view_count)} views</span>
                <a
                  href={currentShort.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-300 font-bold hover:underline"
                >
                  Watch on YouTube &rarr;
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
