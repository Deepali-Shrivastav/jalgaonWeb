'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
    });
  } catch {
    return isoString;
  }
}

function formatViews(viewsStr?: string): string {
  if (!viewsStr) return '1.2K';
  const num = parseInt(viewsStr, 10);
  if (isNaN(num)) return viewsStr;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

const DEMO_PODCASTS: YouTubeVideo[] = [
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'Jalgaon Business Podcast — EP 01: Economic Growth & Trade Secrets',
    description: 'In-depth conversation on Jalgaon’s gold markets, agricultural exports, and business ecosystem.',
    thumbnail_url: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=800',
    published_at: '2024-10-24T10:00:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 3238,
    is_short: false,
    view_count: '53000000',
  },
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'Banana Capital Agriculture Podcast — EP 02: Farming Innovations',
    description: 'Interviews with progressive Jalgaon farmers pioneering modern banana cultivation & exports.',
    thumbnail_url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=800',
    published_at: '2024-10-18T14:30:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 1850,
    is_short: false,
    view_count: '716000',
  },
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'Gold City Podcast — EP 03: Inside Jalgaon Jewellery Crafting',
    description: 'Conversations with master goldsmiths and trade leaders in Jalgaon’s legendary bullion market.',
    thumbnail_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800',
    published_at: '2024-10-15T09:15:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 2140,
    is_short: false,
    view_count: '240000',
  },
];

function getHighResThumbnail(video?: YouTubeVideo | null): string {
  if (!video) return 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800';
  if (video.thumbnail_url && !video.thumbnail_url.includes('hqdefault.jpg') && !video.thumbnail_url.includes('mqdefault.jpg') && !video.thumbnail_url.includes('sddefault.jpg') && !video.thumbnail_url.includes('default.jpg')) {
    return video.thumbnail_url;
  }
  if (video.video_id) {
    return `https://i.ytimg.com/vi/${video.video_id}/maxresdefault.jpg`;
  }
  return video.thumbnail_url || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800';
}

interface JalgaonGlimpseProps {
  initialData?: YouTubeVideo[];
}

export default function JalgaonGlimpse({ initialData }: JalgaonGlimpseProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>(
    initialData && initialData.length > 0 ? initialData.slice(0, 3) : DEMO_PODCASTS
  );

  useEffect(() => {
    if (!initialData || initialData.length === 0) {
      const fetchVideos = async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const res = await fetch(`${baseUrl}/api/v1/jalgaon-glimpse/videos/?max_results=3`);
          if (res.ok) {
            const data: YouTubeVideoListResponse = await res.json();
            if (data.results && data.results.length > 0) {
              setVideos(data.results.slice(0, 3));
            }
          }
        } catch (err) {
          // Keep DEMO_PODCASTS
        }
      };
      fetchVideos();
    }
  }, [initialData]);

  const displayVideos = videos.length > 0 ? videos : DEMO_PODCASTS;

  return (
    <section id="jalgaon-glimpse" className="bg-surface-container-low py-section" aria-labelledby="jalgaon-glimpse-heading">
      <div className="mx-auto max-w-container-max px-base sm:px-xxl">
        {/* Section Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="mb-xs text-xs font-extrabold uppercase tracking-[0.2em] text-[#0081C7] flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-[#0081C7] animate-pulse" />
              Jalgaon Podcast Channel
            </p>
            <h2 id="jalgaon-glimpse-heading" className="text-3xl font-black text-ink-deep md:text-4xl tracking-tight">
              Jalgaon Glimpse
            </h2>
            <p className="text-secondary text-sm md:text-base mt-1 font-medium">
              Listen & watch exclusive Jalgaon podcasts, inspiring interviews, and local discussions.
            </p>
          </div>

          <Link
            href="/jalgaon-glimpse"
            className="group flex items-center gap-xs text-sm font-bold text-[#0081C7] hover:text-sky-700 transition-colors self-start sm:self-auto"
          >
            All Podcast Episodes
            <span className="material-symbols-outlined text-lg text-[#0081C7] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* 3 Modern YouTube Cards Grid (Matching YouTube Homepage UI) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayVideos.slice(0, 3).map((video, idx) => (
            <div key={`${video.video_id}-${idx}`} className="group flex flex-col cursor-pointer">
              <Link href={`/jalgaon-glimpse/${video.video_id}`} className="block">
                {/* 16:9 Thumbnail Card with Rounded-2xl */}
                <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden mb-3 shadow-md border border-hairline-soft">
                  <img
                    src={getHighResThumbnail(video)}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Dark Vignette Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />

                  {/* Centered Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 bg-[#0081C7] text-white rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <span className="material-symbols-outlined text-3xl translate-x-0.5 fill-current">
                        play_arrow
                      </span>
                    </div>
                  </div>

                  {/* Duration Badge (Bottom-Right) */}
                  {!!video.duration_seconds && video.duration_seconds > 0 && (
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/85 text-white text-xs font-sans font-extrabold tracking-tight rounded-md backdrop-blur-sm shadow-sm">
                      {formatDuration(video.duration_seconds)}
                    </div>
                  )}

                  {/* Shorts Badge (Top-Left) */}
                  {video.is_short && (
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-[#0081C7] text-white text-[11px] font-bold rounded-full flex items-center gap-1 shadow">
                      <span>⚡</span> Shorts
                    </div>
                  )}
                </div>
              </Link>

              {/* YouTube Channel Style Info Block Below Thumbnail */}
              <div className="flex items-start gap-3 px-0.5">
                {/* Circular Channel Avatar */}
                <Link href="/jalgaon-glimpse" className="shrink-0">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm border border-hairline-soft overflow-hidden p-1 shrink-0">
                    <img
                      src="/title-logo.png"
                      alt="Jalgaon Logo"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                </Link>

                {/* Main Text Content */}
                <div className="flex-grow min-w-0">
                  <Link href={`/jalgaon-glimpse/${video.video_id}`}>
                    <h3 className="text-sm sm:text-base font-bold text-ink-deep group-hover:text-[#0081C7] transition-colors line-clamp-2 leading-snug">
                      {video.title}
                    </h3>
                  </Link>

                  {/* Channel / Author Name */}
                  <div className="text-xs text-secondary font-medium mt-1 flex items-center gap-1 hover:text-ink-deep">
                    <span>Jalgaon Glimpse Podcast</span>
                    <span className="material-symbols-outlined text-xs text-[#0081C7]">check_circle</span>
                  </div>

                  {/* Views & Date Meta Line */}
                  <div className="text-xs text-secondary font-normal mt-0.5 flex items-center gap-1.5">
                    <span>{formatViews(video.view_count)} views</span>
                    <span>•</span>
                    <span>{formatDate(video.published_at || '')}</span>
                  </div>
                </div>

                {/* 3-Dots Menu Icon */}
                <button
                  type="button"
                  aria-label="Video options"
                  className="text-secondary hover:text-ink-deep p-1 shrink-0 rounded-full hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">more_vert</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
