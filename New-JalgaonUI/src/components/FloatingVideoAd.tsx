"use client";

import React, { useState, useEffect } from "react";

interface FloatingAdData {
  enabled: boolean;
  platform: "youtube" | "instagram" | string;
  title?: string;
  url: string;
  embed_url: string;
  video_id: string;
  error?: string;
}

export default function FloatingVideoAd() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [adConfig, setAdConfig] = useState<FloatingAdData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Check if user has closed the ad during this browser session
    const isClosedInSession = sessionStorage.getItem("jalgaon_floating_ad_closed");
    if (isClosedInSession === "true") {
      return;
    }

    const fetchAdConfig = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/v1/ads/floating-video-ad/`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data: FloatingAdData = await res.json();
          if (data && data.enabled && data.embed_url) {
            setAdConfig(data);
            setIsVisible(true);
          }
        }
      } catch (err) {
        // Fail silently so public website is never disrupted
        console.warn("Floating video ad fetch failed silently:", err);
      }
    };

    fetchAdConfig();
  }, [baseUrl]);

  // Process Instagram embed script when Instagram platform is active
  useEffect(() => {
    if (adConfig?.platform === "instagram" && isVisible && !isMinimized && typeof window !== "undefined") {
      if (!document.getElementById("instagram-embed-script")) {
        const script = document.createElement("script");
        script.id = "instagram-embed-script";
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        script.onload = () => {
          if ((window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
          }
        };
        document.body.appendChild(script);
      } else if ((window as any).instgrm) {
        (window as any).instgrm.Embeds.process();
      }
    }
  }, [adConfig, isVisible, isMinimized]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("jalgaon_floating_ad_closed", "true");
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isVisible || !adConfig || !adConfig.enabled || !adConfig.embed_url) {
    return null;
  }

  const isYouTube = adConfig.platform === "youtube";
  const isShorts = isYouTube && adConfig.url.toLowerCase().includes("shorts");
  const isInstagram = adConfig.platform === "instagram";
  const isVertical = isShorts || isInstagram;

  // Thumbnail image for left circular avatar
  const thumbnailUrl = isYouTube && adConfig.video_id
    ? `https://img.youtube.com/vi/${adConfig.video_id}/mqdefault.jpg`
    : "/main-logo.png";

  const videoTitle = adConfig.title?.trim() || "Feature of the day";
  const instagramEmbedUrl = `https://www.instagram.com/p/${adConfig.video_id}/embed/`;

  return (
    <aside
      aria-label="Floating Advertisement"
      className="fixed z-40 transition-all duration-300 ease-in-out bottom-20 right-3 sm:bottom-6 sm:right-6 max-w-[calc(100vw-1.5rem)]"
    >
      {isMinimized ? (
        /* White Compact Pill Banner - EXACT MATCH TO SCREENSHOT */
        <div className="bg-white border border-slate-100 rounded-[22px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2.5 px-3.5 flex items-center justify-between gap-3 text-slate-900 max-w-sm transition-all duration-300">
          {/* Left Circular Video Thumbnail */}
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200/80 flex-shrink-0 bg-slate-100 flex items-center justify-center">
            <img
              src={thumbnailUrl}
              alt={videoTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/main-logo.png";
              }}
            />
          </div>

          {/* Middle Text Info */}
          <div className="min-w-0 flex-1 pr-1">
            <span className="text-[#0088cc] text-[11px] font-extrabold uppercase tracking-wider block">
              FEATURE OF THE DAY
            </span>
            <h4 className="text-slate-900 font-bold text-sm truncate leading-tight">
              {videoTitle}
            </h4>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleToggleMinimize}
              className="bg-[#0088cc] hover:bg-[#0077bb] text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-md shadow-sky-500/20 transition-all duration-200 cursor-pointer"
            >
              View
            </button>
            <button
              onClick={handleClose}
              title="Close"
              aria-label="Close advertisement"
              className="text-slate-400 hover:text-slate-600 p-1 transition-colors flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
      ) : (
        /* Full Floating Video Player Box */
        <div
          className={`bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col transition-all duration-300 ${
            isVertical ? "w-72 sm:w-[310px]" : "w-72 sm:w-80"
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-slate-100 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0088cc] flex-shrink-0 animate-pulse"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0088cc]">
                FEATURE OF THE DAY
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleMinimize}
                title="Minimize"
                aria-label="Minimize advertisement"
                className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition-colors flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">remove</span>
              </button>
              <button
                onClick={handleClose}
                title="Close"
                aria-label="Close advertisement"
                className="p-0.5 text-slate-400 hover:text-rose-500 rounded transition-colors flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>

          {/* Video Embed Frame */}
          <div className="relative w-full bg-black">
            {isInstagram ? (
              <div className="w-full aspect-[9/16] min-h-[360px] max-h-[420px] bg-white overflow-hidden">
                <iframe
                  src={instagramEmbedUrl}
                  title={videoTitle}
                  className="w-full h-full border-0 bg-white"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            ) : isVertical ? (
              <div className="w-full aspect-[9/16] max-h-[380px]">
                <iframe
                  src={adConfig.embed_url}
                  title={videoTitle}
                  className="w-full h-full border-0 bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video w-full">
                <iframe
                  src={adConfig.embed_url}
                  title={videoTitle}
                  className="w-full h-full border-0 bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>

          {/* Footer Badge */}
          <div className="px-3.5 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-100 flex-shrink-0 overflow-hidden flex items-center justify-center p-0.5">
              <img
                src="/title-logo.png"
                alt="Jalgaon.com"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/main-logo.png";
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {videoTitle}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                <span>jalgaondotcom</span>
                <span className="material-symbols-outlined text-[14px] text-[#0088cc]">
                  check_circle
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
