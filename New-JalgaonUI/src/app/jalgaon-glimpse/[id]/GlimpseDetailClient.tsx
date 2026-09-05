'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { YouTubeVideo, YouTubeChannelInfo, DEFAULT_FALLBACK_VIDEOS, getHighResThumbnail, handleThumbnailError } from '@/types/youtube';

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

function formatNumber(numStr?: string): string {
  if (!numStr) return '1.2M';
  const num = parseInt(numStr, 10);
  if (isNaN(num)) return numStr;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat('en-IN').format(num);
}

function formatSubscribers(countStr?: string): string {
  if (!countStr) return '';
  const num = parseInt(countStr, 10);
  if (isNaN(num)) return countStr;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M subscribers`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K subscribers`;
  return `${num} subscribers`;
}

interface GlimpseDetailClientProps {
  videoId: string;
  initialVideo?: YouTubeVideo | null;
}

export default function GlimpseDetailClient({ videoId, initialVideo }: GlimpseDetailClientProps) {
  const [video, setVideo] = useState<YouTubeVideo | null>(initialVideo || null);
  const [channelInfo, setChannelInfo] = useState<YouTubeChannelInfo | null>(null);
  const [sidebarVideos, setSidebarVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(!initialVideo);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'channel' | 'related'>('all');
  const [showMoreShorts, setShowMoreShorts] = useState<boolean>(false);

  useEffect(() => {
    const fetchChannelInfo = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        let res = await fetch(`${baseUrl}/api/v1/jalgaon-glimpse/channel/`);
        if (!res.ok && baseUrl) {
          res = await fetch('/api/v1/jalgaon-glimpse/channel/');
        }
        if (res.ok) {
          const data: YouTubeChannelInfo = await res.json();
          setChannelInfo(data);
        }
      } catch { }
    };
    fetchChannelInfo();
    const fetchSidebarVideos = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        let res = await fetch(`${baseUrl}/api/v1/jalgaon-glimpse/videos/?max_results=8`);
        if (!res.ok && baseUrl) {
          res = await fetch('/api/v1/jalgaon-glimpse/videos/?max_results=8');
        }
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setSidebarVideos(data.results.filter((v: YouTubeVideo) => v.video_id !== videoId));
          }
        }
      } catch (err) {
        try {
          const res = await fetch('/api/v1/jalgaon-glimpse/videos/?max_results=8');
          if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              setSidebarVideos(data.results.filter((v: YouTubeVideo) => v.video_id !== videoId));
            }
          }
        } catch { }
      }
    };
    fetchSidebarVideos();

    if (!initialVideo && videoId) {
      const fetchVideoDetail = async () => {
        setLoading(true);
        setError(null);
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
          let res = await fetch(`${baseUrl}/api/v1/jalgaon-glimpse/videos/${videoId}/`);
          if (!res.ok && baseUrl) {
            res = await fetch(`/api/v1/jalgaon-glimpse/videos/${videoId}/`);
          }

          if (!res.ok) {
            if (res.status === 404) {
              throw new Error('Video not found or unavailable');
            }
            throw new Error('Could not load video details');
          }

          const data: YouTubeVideo = await res.json();
          setVideo(data);
        } catch (err: any) {
          const fallback = DEFAULT_FALLBACK_VIDEOS.find(v => v.video_id === videoId) || DEFAULT_FALLBACK_VIDEOS[0];
          if (fallback) {
            setVideo(fallback);
            setError(null);
          } else {
            setError(err.message || 'Error loading video');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchVideoDetail();
    }
  }, [videoId, initialVideo]);

  const isShortVideo = video
    ? Boolean(video.is_short || (video.duration_seconds && video.duration_seconds > 0 && video.duration_seconds <= 180))
    : false;

  const [playerMode, setPlayerMode] = useState<'short' | 'standard' | 'auto'>('auto');
  const activeMode = playerMode === 'auto' ? (isShortVideo ? 'short' : 'standard') : playerMode;


  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low">
      <Header />

      {/* Main YouTube Layout Container */}
      <main className="flex-grow max-w-[1750px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-6">
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="aspect-video w-full bg-surface-container-high rounded-2xl animate-pulse" />
              <div className="h-8 bg-surface-container-high rounded-lg w-3/4 animate-pulse" />
              <div className="h-16 bg-surface-container-high rounded-2xl animate-pulse" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-surface-container-high rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white border border-hairline-soft rounded-2xl p-6 sm:p-10 text-center max-w-xl mx-auto my-10 sm:my-16 shadow-sm">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <span className="material-symbols-outlined text-2xl sm:text-3xl">error_outline</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-ink-deep mb-2">
              Video Unavailable
            </h3>
            <p className="text-secondary text-xs sm:text-sm mb-6">
              {error}
            </p>
            <Link
              href="/jalgaon-glimpse"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0081C7] hover:bg-sky-700 text-white rounded-full font-bold shadow text-xs transition-all"
            >
              &larr; Back to Jalgaon Glimpse
            </Link>
          </div>
        )}

        {/* Main YouTube Watch Interface (Matching Brand Color System) */}
        {!loading && !error && video && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Main Column (~68% width = 8 cols) */}
            <div className="lg:col-span-8 space-y-4 min-w-0">

              {/* VIDEO PLAYER CONTAINER */}
              {activeMode === 'short' ? (
                /* --- CLEAN LIGHT MODE SHORTS REEL STAGE --- */
                <div className="relative w-full bg-white border border-hairline-soft rounded-2xl sm:rounded-3xl p-2 sm:p-6 shadow-sm flex flex-col items-center justify-center overflow-hidden my-1">

                  {/* Top Bar Navigation (Hidden on Mobile View) */}
                  <div className="hidden sm:flex w-full items-center justify-between px-1 sm:px-2 mb-3 sm:mb-4">
                    <Link
                      href="/jalgaon-glimpse"
                      className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-100 hover:bg-slate-200 text-ink-deep rounded-full text-[11px] sm:text-xs font-bold transition-all border border-hairline-soft"
                    >
                      <span className="material-symbols-outlined text-sm sm:text-base text-[#0081C7]">arrow_back</span>
                      <span>Back to Glimpse</span>
                    </Link>
                  </div>

                  {/* SHORTS MAIN STAGE CONTAINER (CENTERED 9:16 WITH RESPONSIVE ACTION BUTTONS & INFO) */}
                  <div className="relative flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-6 w-full max-w-[1150px] min-h-[460px] sm:min-h-[580px]">

                    {/* LEFT CHANNEL OVERLAY & TITLE (LIGHT GLASS CARD - DESKTOP ONLY) */}
                    <div className="hidden lg:flex flex-col justify-end max-w-[300px] h-full space-y-3 shrink-0">
                      {/* Channel Row */}
                      <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-hairline-soft shadow-2xs">
                        <div className="w-10 h-10 rounded-full bg-white p-0.5 border border-hairline-soft overflow-hidden shrink-0 shadow-xs">
                          <img src="/title-logo.png" alt="Jalgaon Logo" className="w-full h-full object-contain rounded-full" />
                        </div>
                        <div className="min-w-0 flex-grow">
                          <div className="text-xs font-extrabold text-ink-deep truncate flex items-center gap-1">
                            <span>@JalgaonGlimpse</span>
                            <span className="material-symbols-outlined text-xs text-[#0081C7]">check_circle</span>
                          </div>
                          <span className="text-[11px] text-secondary font-medium">125K subscribers</span>
                        </div>
                        <a
                          href="https://www.youtube.com/channel/UC1_W6Le5fkEDxsNFZEqPsAA?sub_confirmation=1"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#0081C7] hover:bg-sky-700 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all shrink-0 shadow-xs"
                        >
                          Subscribe
                        </a>
                      </div>

                      {/* Video Title & Hashtags */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-hairline-soft shadow-2xs space-y-2">
                        <h2 className="text-xs sm:text-sm font-bold text-ink-deep line-clamp-3 leading-snug">
                          {video.title}
                        </h2>
                        <div className="text-xs font-bold text-[#0081C7] flex items-center gap-2 flex-wrap">
                          <span>#Jalgaon</span>
                          <span>#MarathiPodcast</span>
                          <span>#Shorts</span>
                        </div>
                      </div>
                    </div>

                    {/* CENTER 9:16 VERTICAL VIDEO PLAYER CONTAINER */}
                    <div className="relative aspect-[9/16] w-full max-w-[360px] sm:max-w-[390px] rounded-lg overflow-hidden bg-slate-950 shadow-xl border border-hairline-soft shrink-0">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${video.video_id}?autoplay=1&rel=0&modestbranding=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute -inset-[1px] w-[calc(100%+2px)] h-[calc(100%+2px)] border-0 scale-[1.005]"
                      />

                    </div>

                    {/* MOBILE CHANNEL DETAILS & ACTION CONTROLS CARD (STRUCTURED & NON-OVERLAPPING) */}
                    <div className="sm:hidden w-full max-w-[360px] mt-2 space-y-2.5 px-0.5">
                      {/* Channel & Subscribe Row */}
                      <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-hairline-soft shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-white p-0.5 border border-hairline-soft overflow-hidden shrink-0 shadow-xs">
                            <img src="/title-logo.png" alt="Jalgaon Logo" className="w-full h-full object-contain rounded-full" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-ink-deep truncate flex items-center gap-1">
                              <span>@JalgaonGlimpse</span>
                              <span className="material-symbols-outlined text-xs text-[#0081C7]">check_circle</span>
                            </div>
                            <span className="text-[10px] text-secondary font-medium block truncate">125K subscribers</span>
                          </div>
                        </div>
                        <a
                          href="https://www.youtube.com/channel/UC1_W6Le5fkEDxsNFZEqPsAA?sub_confirmation=1"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#0081C7] hover:bg-sky-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full transition-all shrink-0 shadow-xs"
                        >
                          Subscribe
                        </a>
                      </div>

                      {/* Title & Hashtags */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-hairline-soft space-y-1">
                        <h2 className="text-xs font-bold text-ink-deep line-clamp-2 leading-snug">
                          {video.title}
                        </h2>
                        <div className="text-[11px] font-bold text-[#0081C7] flex items-center gap-1.5 flex-wrap">
                          <span>#Jalgaon</span>
                          <span>#MarathiPodcast</span>
                          <span>#Shorts</span>
                        </div>
                      </div>

                      {/* Action Pill Controls Row */}
                      <div className="flex items-center justify-between gap-1.5 bg-slate-50 p-2 rounded-xl border border-hairline-soft">
                        {/* Like Button */}
                        <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-hairline-soft hover:bg-slate-100 text-xs font-bold transition-all shadow-2xs">
                          <span className="material-symbols-outlined text-base text-[#0081C7]">favorite</span>
                          <span>{formatNumber(video.like_count || '85000')}</span>
                        </button>

                        {/* Comment Button */}
                        <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-hairline-soft hover:bg-slate-100 text-xs font-bold transition-all shadow-2xs">
                          <span className="material-symbols-outlined text-base text-secondary">chat_bubble</span>
                          <span>252</span>
                        </button>

                        {/* Share Button */}
                        <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-hairline-soft hover:bg-slate-100 text-xs font-bold transition-all shadow-2xs">
                          <span className="material-symbols-outlined text-base text-secondary">share</span>
                          <span>Share</span>
                        </button>

                        {/* Watch on YouTube Button */}
                        <a
                          href={video.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white text-xs font-extrabold transition-all shadow-2xs"
                          title="Watch on YouTube"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                          <span>Glimpse</span>
                        </a>
                      </div>
                    </div>

                    {/* RIGHT ACTION BUTTONS COLUMN (TABLET & DESKTOP ONLY) */}
                    <div className="hidden sm:flex flex-col items-center justify-end h-full space-y-3 sm:space-y-4 shrink-0">
                      {/* Like Button */}
                      <button type="button" className="flex flex-col items-center gap-0.5 sm:gap-1 group">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 group-hover:bg-[#0081C7] group-hover:text-white text-ink-deep border border-hairline-soft flex items-center justify-center transition-all shadow-2xs group-hover:scale-110">
                          <span className="material-symbols-outlined text-xl sm:text-2xl text-[#0081C7] group-hover:text-white">favorite</span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-extrabold text-ink-deep">{formatNumber(video.like_count || '85000')}</span>
                      </button>

                      {/* Comment Button */}
                      <button type="button" className="flex flex-col items-center gap-0.5 sm:gap-1 group">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 group-hover:bg-[#0081C7] group-hover:text-white text-ink-deep border border-hairline-soft flex items-center justify-center transition-all shadow-2xs group-hover:scale-110">
                          <span className="material-symbols-outlined text-xl sm:text-2xl text-secondary group-hover:text-white">chat_bubble</span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-extrabold text-ink-deep">252</span>
                      </button>

                      {/* Share Button */}
                      <button type="button" className="flex flex-col items-center gap-0.5 sm:gap-1 group">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 group-hover:bg-[#0081C7] group-hover:text-white text-ink-deep border border-hairline-soft flex items-center justify-center transition-all shadow-2xs group-hover:scale-110">
                          <span className="material-symbols-outlined text-xl sm:text-2xl text-secondary group-hover:text-white">share</span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-extrabold text-ink-deep">Share</span>
                      </button>

                      {/* Watch on YouTube Button */}
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-0.5 sm:gap-1 group"
                        title="Watch on YouTube"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-50 group-hover:bg-red-600 text-red-600 group-hover:text-white border border-red-200 flex items-center justify-center transition-all shadow-2xs group-hover:scale-110">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-secondary">Glimpse</span>
                      </a>
                    </div>

                    {/* FAR RIGHT FLOATING NEXT / PREV ARROWS */}
                    <div className="hidden md:flex flex-col items-center justify-center gap-3 shrink-0 ml-2">
                      <button
                        type="button"
                        aria-label="Previous video"
                        className="w-11 h-11 rounded-full bg-slate-100 hover:bg-[#0081C7] text-secondary hover:text-white flex items-center justify-center shadow-xs transition-all border border-hairline-soft"
                      >
                        <span className="material-symbols-outlined text-xl">arrow_upward</span>
                      </button>

                      <button
                        type="button"
                        aria-label="Next video"
                        className="w-11 h-11 rounded-full bg-slate-100 hover:bg-[#0081C7] text-secondary hover:text-white flex items-center justify-center shadow-xs transition-all border border-hairline-soft group relative"
                      >
                        <span className="material-symbols-outlined text-xl">arrow_downward</span>
                        <span className="absolute right-14 bg-ink-deep text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Next video
                        </span>
                      </button>
                    </div>

                  </div>
                </div>
              ) : (
                /* --- STANDARD WIDESCREEN PLAYER (16:9 ASPECT RATIO) --- */
                <div className="relative aspect-video w-full rounded-md overflow-hidden bg-slate-950 shadow-lg border border-hairline-soft">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.video_id}?autoplay=1&rel=0&modestbranding=1`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute -inset-[1px] w-[calc(100%+2px)] h-[calc(100%+2px)] border-0 scale-[1.005]"
                  />
                </div>
              )}

              {/* Video Title */}
              <h1 className="text-lg sm:text-2xl font-black text-ink-deep leading-snug tracking-tight">
                {video.title}
              </h1>

              {/* YouTube Channel & Actions Row (Mobile Responsive Flex Wrap) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 py-2 border-b border-hairline-soft pb-4">
                {/* Left: Channel Info */}
                <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Link href="/jalgaon-glimpse" className="shrink-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white p-0.5 border-2 border-[#0081C7]/30 overflow-hidden shrink-0 shadow-md hover:scale-105 transition-transform">
                        <img
                          src="/title-logo.png"
                          alt="Jalgaon Logo"
                          className="w-full h-full object-contain rounded-full"
                        />
                      </div>
                    </Link>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-base font-extrabold text-ink-deep hover:text-[#0081C7] transition-colors truncate">
                        <span className="truncate">{channelInfo?.title || 'jalgaondotcom'}</span>
                        <span className="material-symbols-outlined text-sm sm:text-base text-[#0081C7] shrink-0">check_circle</span>
                      </div>
                      {channelInfo?.subscriber_count && (
                        <span className="text-[11px] sm:text-xs text-secondary font-medium block truncate">{formatSubscribers(channelInfo.subscriber_count)}</span>
                      )}
                    </div>
                  </div>

                  <a
                    href="https://www.youtube.com/channel/UC1_W6Le5fkEDxsNFZEqPsAA?sub_confirmation=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-[#0081C7] to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-extrabold text-[11px] sm:text-xs px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1 shrink-0 ml-auto sm:ml-3"
                  >
                    <span>🔔</span> Subscribe
                  </a>
                </div>

                {/* Right: YouTube Action Pill Controls (Fully Aligned & Always Visible) */}
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar py-1 max-w-full">
                  {/* Like/Dislike Pill */}
                  <div className="h-9 bg-white hover:bg-slate-50 text-ink-deep border border-hairline-soft rounded-full flex items-center text-xs font-bold transition-all shadow-xs shrink-0">
                    <button type="button" className="h-full flex items-center gap-1 pl-3 pr-2.5 sm:px-4 hover:bg-slate-100 rounded-l-full border-r border-hairline-soft">
                      <span className="material-symbols-outlined text-base text-[#0081C7]">thumb_up</span>
                      <span>{formatNumber(video.like_count || '44000')}</span>
                    </button>
                    <button type="button" className="h-full flex items-center px-2.5 sm:px-3.5 hover:bg-slate-100 rounded-r-full">
                      <span className="material-symbols-outlined text-base text-secondary">thumb_down</span>
                    </button>
                  </div>

                  {/* Share Pill */}
                  <button
                    type="button"
                    className="h-9 bg-white hover:bg-slate-50 text-ink-deep border border-hairline-soft px-3 sm:px-4 rounded-full text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all shadow-xs hover:border-sky-300 shrink-0"
                  >
                    <span className="material-symbols-outlined text-base text-[#0081C7]">share</span>
                    <span>Share</span>
                  </button>

                  {/* Watch on YouTube Pill */}
                  <a
                    href={video.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white px-3 sm:px-4 rounded-full text-xs font-extrabold flex items-center gap-1 sm:gap-1.5 transition-all shadow-md hover:scale-105 shrink-0"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span>YouTube</span>
                  </a>

                  {/* 3-Dots Menu Pill */}
                  <button
                    type="button"
                    aria-label="More options"
                    className="h-9 w-9 bg-white hover:bg-slate-100 border border-hairline-soft text-ink-deep rounded-full flex items-center justify-center transition-colors shadow-xs shrink-0"
                  >
                    <span className="material-symbols-outlined text-base">more_horiz</span>
                  </button>
                </div>
              </div>

              {/* YouTube Description Card Container */}
              <div
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="bg-gradient-to-br from-white via-sky-50/20 to-white border border-hairline-soft hover:border-[#0081C7]/30 p-4 sm:p-5 rounded-2xl text-xs sm:text-sm text-ink-deep cursor-pointer transition-all space-y-2 shadow-xs hover:shadow-md"
              >
                <div className="font-extrabold text-ink-deep flex items-center gap-2 text-xs flex-wrap">
                  <span className="bg-[#0081C7]/10 text-[#0081C7] px-2.5 py-0.5 rounded-full font-bold">
                    👁 {formatNumber(video.view_count)} views
                  </span>
                  <span>•</span>
                  <span className="text-secondary font-semibold">{formatDate(video.published_at || '')}</span>
                  <span>•</span>
                  <span className="text-[#0081C7] font-bold">#Jalgaon</span>
                  <span className="text-[#0081C7] font-bold">#Podcast</span>
                  <span className="text-[#0081C7] font-bold">#Shorts</span>
                </div>

                <p className={`whitespace-pre-wrap text-secondary font-normal leading-relaxed ${!showFullDescription ? 'line-clamp-3' : ''
                  }`}>
                  {video.description || 'Welcome to the official Jalgaon Glimpse Podcast channel. Subscribe for weekly episodes on local business, culture, and stories.'}
                </p>

                <div className="font-bold text-[#0081C7] text-xs pt-1 flex items-center gap-1 hover:underline">
                  <span>{showFullDescription ? 'Show less ↑' : 'Show more ↓'}</span>
                </div>
              </div>
            </div>

            {/* Right Sidebar Column (~32% width = 4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Filter Pills Bar */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 hide-scrollbar">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${filter === 'all'
                    ? 'bg-[#0081C7] text-white shadow-sm'
                    : 'bg-white border border-hairline-soft text-secondary hover:text-ink-deep'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('channel')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${filter === 'channel'
                    ? 'bg-[#0081C7] text-white shadow-sm'
                    : 'bg-white border border-hairline-soft text-secondary hover:text-ink-deep'
                    }`}
                >
                  From Jalgaon Glimpse
                </button>
                <button
                  onClick={() => setFilter('related')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${filter === 'related'
                    ? 'bg-[#0081C7] text-white shadow-sm'
                    : 'bg-white border border-hairline-soft text-secondary hover:text-ink-deep'
                    }`}
                >
                  Related
                </button>
              </div>

              {/* Related Videos Stack: Top 2 Videos -> 2 Shorts (with Show More) -> Remaining Videos */}
              {(() => {
                const displayList = sidebarVideos.length > 0
                  ? sidebarVideos
                  : DEFAULT_FALLBACK_VIDEOS.filter((v) => v.video_id !== videoId);

                const regVideos = displayList.filter((v) => !v.is_short);
                const shortVidList = displayList.filter((v) => v.is_short);

                // 1. Top 2 videos from channel
                const top2Videos = regVideos.slice(0, 2);
                // 2. Shorts: top 4 shorts in a 2x2 grid (matching new photo design)
                const top4Shorts = shortVidList.slice(0, 4);
                // 3. Remaining videos (video 3, 4, 5...)
                const remainingVideos = regVideos.slice(2);

                return (
                  <div className="space-y-4">
                    {/* SECTION 1: TOP 2 VIDEOS (STACKED FULL-WIDTH ONE BELOW ANOTHER) */}
                    {top2Videos.length > 0 && (
                      <div className="space-y-2.5">
                        {top2Videos.map((item, idx) => (
                          <Link
                            key={`top-v-${item.video_id}-${idx}`}
                            href={`/jalgaon-glimpse/${item.video_id}`}
                            className="group flex items-start gap-3 cursor-pointer bg-white p-2 rounded-md border border-hairline-soft hover:shadow-md transition-all"
                          >
                            {/* Widescreen 16:9 Thumbnail */}
                            <div className="relative w-36 sm:w-40 aspect-video rounded-md overflow-hidden shrink-0 bg-slate-900 border border-hairline-soft">
                              <img
                                src={getHighResThumbnail(item)}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                onError={handleThumbnailError}
                              />
                              {!!item.duration_seconds && item.duration_seconds > 0 && (
                                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono px-1 rounded font-bold">
                                  {formatDuration(item.duration_seconds)}
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-grow min-w-0 pr-1">
                              <h4 className="text-xs sm:text-sm font-bold text-ink-deep line-clamp-2 leading-snug group-hover:text-[#0081C7] transition-colors">
                                {item.title}
                              </h4>

                              <div className="text-[11px] text-secondary font-medium mt-1 flex items-center gap-1">
                                <span>Jalgaon Glimpse Podcast</span>
                                <span className="material-symbols-outlined text-[10px] text-[#0081C7]">check_circle</span>
                              </div>

                              <div className="text-[11px] text-secondary font-normal mt-0.5">
                                <span>{formatNumber(item.view_count)} views</span>
                                <span> • </span>
                                <span>{formatDate(item.published_at || '')}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              aria-label="Video options"
                              className="text-secondary hover:text-ink-deep p-1 shrink-0 rounded-full"
                            >
                              <span className="material-symbols-outlined text-base">more_vert</span>
                            </button>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* SECTION 2: SHORTS SECTION (4 SHORTS DISPLAYED IN A 2x2 GRID MATCHING NEW PHOTO DESIGN) */}
                    {shortVidList.length > 0 && (
                      <div className="py-2 space-y-2 border-y border-hairline-soft/80 my-2">
                        <div className="flex items-center justify-between px-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#0081C7] animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-wider text-ink-deep">
                              Glimpse
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowMoreShorts((prev) => !prev)}
                            className="text-[11px] font-bold text-[#0081C7] hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            {showMoreShorts ? 'Show less ↑' : 'Show more →'}
                          </button>
                        </div>

                        {/* 2-Column Grid (Two Shorts Per Row Side By Side) */}
                        <div className="grid grid-cols-2 gap-3">
                          {(showMoreShorts ? shortVidList : top4Shorts).map((short, idx) => (
                            <Link
                              key={`side-short-${short.video_id}-${idx}`}
                              href={`/jalgaon-glimpse/${short.video_id}`}
                              className="group flex flex-col cursor-pointer"
                            >
                              {/* 1. Vertical 9:16 Image Poster Container with Large Rounded Corners (Matching New Photo Design) */}
                              <div className="relative aspect-[9/16] bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border border-hairline-soft mb-2">
                                <img
                                  src={getHighResThumbnail(short)}
                                  alt={short.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                  onError={handleThumbnailError}
                                />

                                {/* Centered Play Disc */}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#0081C7] text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-lg sm:text-xl translate-x-0.5 fill-current">
                                      play_arrow
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* 2. Title & 3-Dot Menu Row Underneath Image */}
                              <div className="flex items-start justify-between gap-1 px-0.5">
                                <h5 className="text-[11px] sm:text-xs font-bold text-ink-deep group-hover:text-[#0081C7] transition-colors line-clamp-2 leading-tight">
                                  {short.title}
                                </h5>
                                <button
                                  type="button"
                                  aria-label="Options"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  className="text-secondary hover:text-ink-deep p-0.5 shrink-0 rounded-full"
                                >
                                  <span className="material-symbols-outlined text-sm">more_vert</span>
                                </button>
                              </div>

                              {/* Views Count Text Underneath Title */}
                              <div className="text-[10px] text-secondary font-normal mt-0.5 px-0.5">
                                <span>{formatNumber(short.view_count)} views</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 3: SUBSEQUENT VIDEOS (CONTINUATION OF CHANNEL VIDEOS LIST) */}
                    {remainingVideos.length > 0 && (
                      <div className="space-y-2.5 pt-1">
                        <div className="text-[11px] font-black uppercase tracking-wider text-secondary px-0.5 pb-1 border-b border-hairline-soft">
                          More Videos
                        </div>
                        {remainingVideos.map((item, idx) => (
                          <Link
                            key={`rem-v-${item.video_id}-${idx}`}
                            href={`/jalgaon-glimpse/${item.video_id}`}
                            className="group flex items-start gap-3 cursor-pointer bg-white p-2 rounded-md border border-hairline-soft hover:shadow-md transition-all"
                          >
                            {/* Widescreen 16:9 Thumbnail */}
                            <div className="relative w-36 sm:w-40 aspect-video rounded-md overflow-hidden shrink-0 bg-slate-900 border border-hairline-soft">
                              <img
                                src={getHighResThumbnail(item)}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                onError={handleThumbnailError}
                              />
                              {!!item.duration_seconds && item.duration_seconds > 0 && (
                                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono px-1 rounded font-bold">
                                  {formatDuration(item.duration_seconds)}
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-grow min-w-0 pr-1">
                              <h4 className="text-xs sm:text-sm font-bold text-ink-deep line-clamp-2 leading-snug group-hover:text-[#0081C7] transition-colors">
                                {item.title}
                              </h4>

                              <div className="text-[11px] text-secondary font-medium mt-1 flex items-center gap-1">
                                <span>Jalgaon Glimpse Podcast</span>
                                <span className="material-symbols-outlined text-[10px] text-[#0081C7]">check_circle</span>
                              </div>

                              <div className="text-[11px] text-secondary font-normal mt-0.5">
                                <span>{formatNumber(item.view_count)} views</span>
                                <span> • </span>
                                <span>{formatDate(item.published_at || '')}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              aria-label="Video options"
                              className="text-secondary hover:text-ink-deep p-1 shrink-0 rounded-full"
                            >
                              <span className="material-symbols-outlined text-base">more_vert</span>
                            </button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

