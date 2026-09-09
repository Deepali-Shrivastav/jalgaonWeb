"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface FloatingAdItem {
  id?: number;
  enabled?: boolean;
  is_enabled?: boolean;
  platform: "youtube" | "instagram" | string;
  title?: string;
  url?: string;
  video_url?: string;
  embed_url: string;
  video_id: string;
  status?: string;
}

interface ApiResponse {
  enabled: boolean;
  title?: string;
  platform?: string;
  url?: string;
  embed_url?: string;
  video_id?: string;
  ads?: FloatingAdItem[];
  count?: number;
}

export default function FloatingVideoAd() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const pathname = usePathname();

  const [activeAds, setActiveAds] = useState<FloatingAdItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
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
          const data: ApiResponse = await res.json();
          if (data.ads && data.ads.length > 0) {
            setActiveAds(data.ads);
            setIsVisible(true);
          } else if (data.enabled && data.embed_url) {
            setActiveAds([
              {
                platform: data.platform || "youtube",
                title: data.title || "Feature of the day",
                embed_url: data.embed_url,
                video_id: data.video_id || "",
                url: data.url || "",
              },
            ]);
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

  // Current Active Ad item
  const currentAd = activeAds[currentIndex] || null;

  // Auto-rotate active ads if there are multiple active ads
  useEffect(() => {
    if (activeAds.length <= 1 || isMinimized || !isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeAds.length);
    }, 12000); // Cycle every 12s

    return () => clearInterval(interval);
  }, [activeAds.length, isMinimized, isVisible]);

  // Dispatch custom event to sync with other floating UI components (e.g. FloatingSideButtons)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAdOpen = isVisible && !isMinimized;
    const event = new CustomEvent("floating-ad-state-change", {
      detail: { isAdOpen },
    });
    window.dispatchEvent(event);

    return () => {
      window.dispatchEvent(
        new CustomEvent("floating-ad-state-change", {
          detail: { isAdOpen: false },
        })
      );
    };
  }, [isVisible, isMinimized]);

  // Process Instagram embed script when Instagram platform is active
  useEffect(() => {
    if (currentAd?.platform === "instagram" && isVisible && typeof window !== "undefined") {
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
  }, [currentAd, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("jalgaon_floating_ad_closed", "true");
  };

  const handleToggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const handleNextAd = () => {
    if (activeAds.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % activeAds.length);
    }
  };

  const handlePrevAd = () => {
    if (activeAds.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + activeAds.length) % activeAds.length);
    }
  };

  // Whitelist of allowed pages for floating video ad
  const isAllowedPage = (path: string | null) => {
    if (!path) return false;
    if (path === "/") return true;

    const allowedPrefixes = [
      "/news",
      "/events",
      "/blog",
      "/jobs",
      "/startups",
      "/clubs",
      "/directory",
      "/category",
      "/add-listing",
      "/add-event",
      "/advertise",
      "/ngo",
      "/ngos",
      "/tourism",
    ];

    return allowedPrefixes.some(
      (prefix) => path === prefix || path.startsWith(prefix + "/")
    );
  };

  const [is404Page, setIs404Page] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const check404 = () => {
        const el = document.querySelector('[data-is-404="true"]');
        setIs404Page(!!el);
      };
      check404();
      const timer = setTimeout(check404, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  if (
    !isAllowedPage(pathname) ||
    is404Page ||
    !isVisible ||
    !currentAd ||
    !currentAd.embed_url
  ) {
    return null;
  }

  const isYouTube = currentAd.platform === "youtube";
  const rawUrl = currentAd.url || currentAd.video_url || "";
  const isShorts = isYouTube && rawUrl.toLowerCase().includes("shorts");
  const isInstagram = currentAd.platform === "instagram";
  const isVertical = isShorts || isInstagram;

  // Thumbnail image for left circular avatar
  const thumbnailUrl =
    isYouTube && currentAd.video_id
      ? `https://img.youtube.com/vi/${currentAd.video_id}/mqdefault.jpg`
      : "/main-logo.png";

  const videoTitle = currentAd.title?.trim() || "Feature of the day";
  const instagramEmbedUrl = `https://www.instagram.com/p/${currentAd.video_id}/embed/`;

  return (
    <aside
      aria-label="Floating Advertisement"
      className="fixed z-40 bottom-20 right-3 sm:bottom-6 sm:right-6 max-w-[calc(100vw-1.5rem)] select-none"
    >
      {/* Morphing Outer Container */}
      <div
        className={`bg-white border border-slate-200/90 overflow-hidden transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right ${
          isMinimized
            ? "w-[320px] sm:w-[360px] max-h-[62px] rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.12)]"
            : isVertical
            ? "w-[290px] sm:w-[310px] max-h-[580px] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
            : "w-[290px] sm:w-[330px] max-h-[480px] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
        }`}
      >
        {/* Layer A: Minimized Compact Pill View */}
        <div
          className={`p-2.5 px-3.5 flex items-center justify-between gap-3 text-slate-900 transition-all duration-500 ease-in-out ${
            isMinimized
              ? "opacity-100 scale-100 pointer-events-auto relative z-10"
              : "opacity-0 scale-95 pointer-events-none absolute inset-0 z-0 h-0 overflow-hidden p-0"
          }`}
        >
          {/* Left Circular Video Thumbnail */}
          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200/80 flex-shrink-0 bg-slate-100 flex items-center justify-center shadow-sm">
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
            <div className="flex items-center gap-1.5">
              <span className="text-[#0088cc] text-[10px] font-extrabold uppercase tracking-wider block">
                FEATURE OF THE DAY
              </span>
              {activeAds.length > 1 && (
                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">
                  {currentIndex + 1}/{activeAds.length}
                </span>
              )}
            </div>
            <h4 className="text-slate-900 font-bold text-xs truncate leading-tight">
              {videoTitle}
            </h4>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleToggleMinimize}
              className="bg-[#0088cc] hover:bg-[#0077bb] active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md shadow-sky-500/20 transition-all duration-300 cursor-pointer"
            >
              View
            </button>
            <button
              onClick={handleClose}
              title="Close"
              aria-label="Close advertisement"
              className="text-slate-400 hover:text-slate-600 p-1 transition-colors flex items-center justify-center cursor-pointer rounded-full hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Layer B: Expanded Video Player View */}
        <div
          className={`flex flex-col transition-all duration-500 ease-in-out ${
            !isMinimized
              ? "opacity-100 scale-100 pointer-events-auto relative z-10"
              : "opacity-0 scale-95 pointer-events-none absolute inset-0 z-0 h-0 overflow-hidden"
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0088cc] flex-shrink-0 animate-pulse"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0088cc]">
                FEATURE OF THE DAY
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Multi-Ad Navigation Arrows if > 1 active ad */}
              {activeAds.length > 1 && (
                <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-full mr-1">
                  <button
                    onClick={handlePrevAd}
                    title="Previous Advertisement"
                    className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center"
                  >
                    <span className="material-symbols-outlined text-xs">chevron_left</span>
                  </button>
                  <span className="text-[10px] font-bold text-slate-700">
                    {currentIndex + 1}/{activeAds.length}
                  </span>
                  <button
                    onClick={handleNextAd}
                    title="Next Advertisement"
                    className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center"
                  >
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                  </button>
                </div>
              )}

              <button
                onClick={handleToggleMinimize}
                title="Minimize"
                aria-label="Minimize advertisement"
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">remove</span>
              </button>
              <button
                onClick={handleClose}
                title="Close"
                aria-label="Close advertisement"
                className="p-1 text-slate-400 hover:text-rose-500 rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>

          {/* Video Embed Frame */}
          <div className="relative w-full bg-black">
            {isInstagram ? (
              <div className="w-full h-[360px] sm:h-[390px] bg-black overflow-hidden relative">
                <iframe
                  key={currentAd.video_id || currentAd.embed_url}
                  src={instagramEmbedUrl}
                  title={videoTitle}
                  className="w-full h-[470px] border-0 bg-white"
                  scrolling="no"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            ) : isVertical ? (
              <div className="w-full aspect-[9/16] max-h-[380px]">
                <iframe
                  key={currentAd.video_id || currentAd.embed_url}
                  src={currentAd.embed_url}
                  title={videoTitle}
                  className="w-full h-full border-0 bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video w-full">
                <iframe
                  key={currentAd.video_id || currentAd.embed_url}
                  src={currentAd.embed_url}
                  title={videoTitle}
                  className="w-full h-full border-0 bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>

          {/* Footer Badge */}
          <div className="px-3.5 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 flex-shrink-0 overflow-hidden flex items-center justify-center">
                <img
                  src={thumbnailUrl}
                  alt={videoTitle}
                  className="w-full h-full object-cover"
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

            {/* Optional dot indicators if > 1 active ad */}
            {activeAds.length > 1 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {activeAds.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex ? "bg-[#0088cc] w-3" : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
