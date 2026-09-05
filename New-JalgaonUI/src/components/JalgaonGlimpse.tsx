'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { YouTubeVideo, YouTubeVideoListResponse, DEFAULT_FALLBACK_VIDEOS, getHighResThumbnail, handleThumbnailError, formatDuration, formatDate, formatViews } from '@/types/youtube';

interface JalgaonGlimpseProps {
  initialData?: YouTubeVideo[];
}

export default function JalgaonGlimpse({ initialData }: JalgaonGlimpseProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>(
    initialData && initialData.length > 0 ? initialData.slice(0, 3) : []
  );
  const [loading, setLoading] = useState<boolean>(!initialData || initialData.length === 0);

  useEffect(() => {
    if (!initialData || initialData.length === 0) {
      const fetchVideos = async () => {
        setLoading(true);
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
          let res = await fetch(`${baseUrl}/api/v1/jalgaon-glimpse/videos/?max_results=3`);
          if (!res.ok && baseUrl) {
            res = await fetch('/api/v1/jalgaon-glimpse/videos/?max_results=3');
          }
          if (res.ok) {
            const data: YouTubeVideoListResponse = await res.json();
            if (data.results && data.results.length > 0) {
              setVideos(data.results.slice(0, 3));
            }
          }
        } catch (err) {
          try {
            const res = await fetch('/api/v1/jalgaon-glimpse/videos/?max_results=3');
            if (res.ok) {
              const data: YouTubeVideoListResponse = await res.json();
              if (data.results && data.results.length > 0) {
                setVideos(data.results.slice(0, 3));
              }
            }
          } catch { }
        } finally {
          setLoading(false);
        }
      };
      fetchVideos();
    }
  }, [initialData]);

  const displayVideos = videos.length > 0 ? videos : DEFAULT_FALLBACK_VIDEOS.slice(0, 3);

  return (
    <section id="jalgaon-glimpse" className="bg-surface-container-low py-8 sm:py-12 md:py-section" aria-labelledby="jalgaon-glimpse-heading">
      <div className="mx-auto max-w-container-max px-4 sm:px-6 md:px-xxl">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div>
            <p className="mb-xs text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.2em] text-[#0081C7] flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-[#0081C7] animate-pulse" />
              Jalgaon Podcast Channel
            </p>
            <h2 id="jalgaon-glimpse-heading" className="text-2xl sm:text-3xl font-black text-ink-deep md:text-4xl tracking-tight">
              Jalgaon Glimpse
            </h2>
            <p className="text-secondary text-xs sm:text-sm md:text-base mt-1 font-medium leading-relaxed">
              Listen & watch exclusive Jalgaon podcasts, inspiring interviews, and local discussions.
            </p>
          </div>

          <Link
            href="/jalgaon-glimpse"
            className="group flex items-center gap-xs text-xs sm:text-sm font-bold text-[#0081C7] hover:text-sky-700 transition-colors self-start sm:self-auto"
          >
            All Podcast Episodes
            <span className="material-symbols-outlined text-base sm:text-lg text-[#0081C7] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* 3 Modern YouTube Cards Grid (Matching YouTube Homepage UI) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {displayVideos.slice(0, 3).map((video, idx) => (
            <div key={`${video.video_id}-${idx}`} className="group flex flex-col cursor-pointer">
              <Link href={`/jalgaon-glimpse/${video.video_id}`} className="block">
                {/* 16:9 Thumbnail Card with Rectangular Rounded Corners */}
                <div className="relative aspect-video w-full bg-slate-900 rounded-md sm:rounded-lg overflow-hidden mb-2.5 sm:mb-3 shadow-sm sm:shadow-md border border-hairline-soft">
                  <img
                    src={getHighResThumbnail(video)}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={handleThumbnailError}
                  />

                  {/* Dark Vignette Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />

                  {/* Centered Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0081C7] text-white rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <span className="material-symbols-outlined text-2xl sm:text-3xl translate-x-0.5 fill-current">
                        play_arrow
                      </span>
                    </div>
                  </div>

                  {/* Duration Badge (Bottom-Right) */}
                  {!!video.duration_seconds && video.duration_seconds > 0 && (
                    <div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 px-2 py-0.5 bg-black/85 text-white text-[10px] sm:text-xs font-sans font-extrabold tracking-tight rounded-md backdrop-blur-sm shadow-sm">
                      {formatDuration(video.duration_seconds)}
                    </div>
                  )}

                  {/* Glimpse Badge (Top-Left) */}
                  {video.is_short && (
                    <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-2 sm:px-2.5 py-0.5 bg-[#0081C7] text-white text-[10px] sm:text-[11px] font-bold rounded-full flex items-center gap-1 shadow">
                      <span>⚡</span> Glimpse
                    </div>
                  )}
                </div>
              </Link>

              {/* YouTube Channel Style Info Block Below Thumbnail */}
              <div className="flex items-start gap-2.5 sm:gap-3 px-0.5">
                {/* Circular Channel Avatar */}
                <Link href="/jalgaon-glimpse" className="shrink-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center shadow-sm border border-hairline-soft overflow-hidden shrink-0">
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
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-ink-deep group-hover:text-[#0081C7] transition-colors line-clamp-2 leading-snug">
                      {video.title}
                    </h3>
                  </Link>

                  {/* Channel / Author Name */}
                  <div className="text-[11px] sm:text-xs text-secondary font-medium mt-0.5 sm:mt-1 flex items-center gap-1 hover:text-ink-deep">
                    <span>jalgaondotcom</span>
                    <span className="material-symbols-outlined text-[11px] sm:text-xs text-[#0081C7]">check_circle</span>
                  </div>

                  {/* Views & Date Meta Line */}
                  <div className="text-[11px] sm:text-xs text-secondary font-normal mt-0.5 flex items-center gap-1.5">
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
                  <span className="material-symbols-outlined text-base sm:text-lg">more_vert</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
