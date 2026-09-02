'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { YouTubeVideo } from '@/types/youtube';

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

const DEMO_SIDEBAR_VIDEOS: YouTubeVideo[] = [
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
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'Ajanta Caves & Jalgaon Heritage Documentary',
    description: 'A visual journey through the ancient rock-cut cave monuments near Jalgaon.',
    thumbnail_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800',
    published_at: '2024-10-22T08:00:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 45,
    is_short: true,
    view_count: '146000000',
  },
];

interface GlimpseDetailClientProps {
  videoId: string;
  initialVideo?: YouTubeVideo | null;
}

export default function GlimpseDetailClient({ videoId, initialVideo }: GlimpseDetailClientProps) {
  const [video, setVideo] = useState<YouTubeVideo | null>(initialVideo || null);
  const [loading, setLoading] = useState<boolean>(!initialVideo);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'channel' | 'related'>('all');

  useEffect(() => {
    if (!initialVideo && videoId) {
      const fetchVideoDetail = async () => {
        setLoading(true);
        setError(null);
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const res = await fetch(`${baseUrl}/api/v1/jalgaon-glimpse/videos/${videoId}/`);

          if (!res.ok) {
            if (res.status === 404) {
              throw new Error('Video not found or unavailable');
            }
            throw new Error('Could not load video details');
          }

          const data: YouTubeVideo = await res.json();
          setVideo(data);
        } catch (err: any) {
          setError(err.message || 'Error loading video');
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
      <main className="flex-grow max-w-[1750px] w-full mx-auto px-4 lg:px-6 py-6">
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
          <div className="bg-white border border-hairline-soft rounded-2xl p-10 text-center max-w-xl mx-auto my-16 shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <span className="material-symbols-outlined text-3xl">error_outline</span>
            </div>
            <h3 className="text-xl font-bold text-ink-deep mb-2">
              Video Unavailable
            </h3>
            <p className="text-secondary text-sm mb-6">
              {error}
            </p>
            <Link
              href="/jalgaon-glimpse"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0081C7] hover:bg-sky-700 text-white rounded-full font-bold shadow text-xs transition-all"
            >
              &larr; Back to Jalgaon Glimpse
            </Link>
          </div>
        )}

        {/* Main YouTube Watch Interface (Matching Brand Color System) */}
        {!loading && !error && video && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Main Column (~68% width = 8 cols) */}
            <div className="lg:col-span-8 space-y-4">

              {/* VIDEO PLAYER CONTAINER */}
              {activeMode === 'short' ? (
                /* --- CLEAN LIGHT MODE SHORTS REEL STAGE --- */
                <div className="relative w-full bg-white border border-hairline-soft rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col items-center justify-center overflow-hidden my-1">
                  
                  {/* Top Bar Navigation */}
                  <div className="w-full flex items-center justify-between px-2 mb-4">
                    <Link
                      href="/jalgaon-glimpse"
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-ink-deep rounded-full text-xs font-bold transition-all border border-hairline-soft"
                    >
                      <span className="material-symbols-outlined text-base text-[#0081C7]">arrow_back</span>
                      <span>Back to Glimpse</span>
                    </Link>
                  </div>

                  {/* SHORTS MAIN STAGE CONTAINER (CENTERED 9:16 WITH SIDEBAR ACTIONS & INFO) */}
                  <div className="relative flex items-center justify-center gap-4 sm:gap-6 w-full max-w-[1150px] min-h-[580px]">

                    {/* LEFT CHANNEL OVERLAY & TITLE (LIGHT GLASS CARD) */}
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
                    <div className="relative aspect-[9/16] w-full max-w-[360px] sm:max-w-[390px] rounded-2xl overflow-hidden bg-slate-950 shadow-xl border border-hairline-soft shrink-0">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${video.video_id}?autoplay=1&rel=0&modestbranding=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute -inset-[1px] w-[calc(100%+2px)] h-[calc(100%+2px)] border-0 scale-[1.005]"
                      />
                    </div>

                    {/* RIGHT ACTION BUTTONS COLUMN */}
                    <div className="flex flex-col items-center justify-end h-full space-y-4 shrink-0">
                      {/* Like Button */}
                      <button type="button" className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-[#0081C7] group-hover:text-white text-ink-deep border border-hairline-soft flex items-center justify-center transition-all shadow-2xs group-hover:scale-110">
                          <span className="material-symbols-outlined text-2xl text-[#0081C7] group-hover:text-white">favorite</span>
                        </div>
                        <span className="text-xs font-extrabold text-ink-deep">{formatNumber(video.like_count || '85000')}</span>
                      </button>

                      {/* Comment Button */}
                      <button type="button" className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-[#0081C7] group-hover:text-white text-ink-deep border border-hairline-soft flex items-center justify-center transition-all shadow-2xs group-hover:scale-110">
                          <span className="material-symbols-outlined text-2xl text-secondary group-hover:text-white">chat_bubble</span>
                        </div>
                        <span className="text-xs font-extrabold text-ink-deep">252</span>
                      </button>

                      {/* Share Button */}
                      <button type="button" className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-[#0081C7] group-hover:text-white text-ink-deep border border-hairline-soft flex items-center justify-center transition-all shadow-2xs group-hover:scale-110">
                          <span className="material-symbols-outlined text-2xl text-secondary group-hover:text-white">share</span>
                        </div>
                        <span className="text-xs font-extrabold text-ink-deep">Share</span>
                      </button>

                      {/* Watch on YouTube Button */}
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1 group"
                        title="Watch on YouTube"
                      >
                        <div className="w-12 h-12 rounded-full bg-red-50 group-hover:bg-red-600 text-red-600 group-hover:text-white border border-red-200 flex items-center justify-center transition-all shadow-2xs group-hover:scale-110">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        </div>
                        <span className="text-[11px] font-bold text-secondary">Shorts</span>
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
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-lg border border-hairline-soft">
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
              <h1 className="text-xl sm:text-2xl font-black text-ink-deep leading-snug tracking-tight">
                {video.title}
              </h1>

              {/* YouTube Channel & Actions Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-hairline-soft pb-4">
                {/* Left: Channel Info */}
                <div className="flex items-center gap-3">
                  <Link href="/jalgaon-glimpse">
                    <div className="w-11 h-11 rounded-full bg-white p-0.5 border-2 border-[#0081C7]/30 overflow-hidden shrink-0 shadow-md hover:scale-105 transition-transform">
                      <img
                        src="/title-logo.png"
                        alt="Jalgaon Logo"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>
                  </Link>

                  <div>
                    <div className="flex items-center gap-1.5 text-sm sm:text-base font-extrabold text-ink-deep hover:text-[#0081C7] transition-colors">
                      <span>Jalgaon Glimpse Podcast</span>
                      <span className="material-symbols-outlined text-base text-[#0081C7]">check_circle</span>
                    </div>
                    <span className="text-xs text-secondary font-medium">125K subscribers</span>
                  </div>

                  <a
                    href="https://www.youtube.com/channel/UC1_W6Le5fkEDxsNFZEqPsAA?sub_confirmation=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 bg-gradient-to-r from-[#0081C7] to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1.5"
                  >
                    <span>🔔</span> Subscribe
                  </a>
                </div>

                {/* Right: YouTube Action Pill Controls */}
                <div className="flex items-center space-x-2">
                  {/* Like/Dislike Pill */}
                  <div className="bg-white hover:bg-slate-50 text-ink-deep border border-hairline-soft rounded-full flex items-center text-xs font-bold transition-all shadow-xs">
                    <button type="button" className="flex items-center gap-1.5 px-4 py-2 hover:bg-slate-100 rounded-l-full border-r border-hairline-soft">
                      <span className="material-symbols-outlined text-base text-[#0081C7]">thumb_up</span>
                      <span>{formatNumber(video.like_count || '44000')}</span>
                    </button>
                    <button type="button" className="px-3.5 py-2 hover:bg-slate-100 rounded-r-full">
                      <span className="material-symbols-outlined text-base text-secondary">thumb_down</span>
                    </button>
                  </div>

                  {/* Share Pill */}
                  <button
                    type="button"
                    className="bg-white hover:bg-slate-50 text-ink-deep border border-hairline-soft px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs hover:border-sky-300"
                  >
                    <span className="material-symbols-outlined text-base text-[#0081C7]">share</span>
                    <span>Share</span>
                  </button>

                  {/* Watch on YouTube Pill */}
                  <a
                    href={video.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md hover:scale-105"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span>YouTube</span>
                  </a>

                  {/* 3-Dots Menu Pill */}
                  <button
                    type="button"
                    className="bg-white hover:bg-slate-100 border border-hairline-soft text-ink-deep w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-base">more_horiz</span>
                  </button>
                </div>
              </div>

              {/* YouTube Description Card Container */}
              <div
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="bg-gradient-to-br from-white via-sky-50/20 to-white border border-hairline-soft hover:border-[#0081C7]/30 p-5 rounded-2xl text-xs sm:text-sm text-ink-deep cursor-pointer transition-all space-y-2 shadow-xs hover:shadow-md"
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

              {/* Related Videos Stack */}
              <div className="space-y-3">
                {DEMO_SIDEBAR_VIDEOS.map((item, idx) => (
                  <Link
                    key={`${item.video_id}-${idx}`}
                    href={`/jalgaon-glimpse/${item.video_id}`}
                    className="group flex items-start gap-3 cursor-pointer bg-white p-2 rounded-xl border border-hairline-soft hover:shadow-md transition-all"
                  >
                    {/* Small Thumbnail */}
                    <div className={`relative ${item.is_short ? 'w-24 aspect-[9/16]' : 'w-36 sm:w-40 aspect-video'} rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-hairline-soft`}>
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {item.is_short ? (
                        <div className="absolute top-1 left-1 bg-[#0081C7] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                          ⚡ Short
                        </div>
                      ) : (
                        !!item.duration_seconds && item.duration_seconds > 0 && (
                          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono px-1 rounded font-bold">
                            {formatDuration(item.duration_seconds)}
                          </div>
                        )
                      )}
                    </div>

                    {/* Right Info */}
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

                    {/* Options Icon */}
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
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

