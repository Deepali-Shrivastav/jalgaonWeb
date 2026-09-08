"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface FloatingAdConfig {
  enabled: boolean;
  platform: "youtube" | "instagram" | string;
  title?: string;
  url: string;
  embed_url: string;
  video_id: string;
  updated_at: string | null;
  valid?: boolean;
  error?: string;
}

export default function AdminFloatingVideoAdPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [enabled, setEnabled] = useState(false);
  const [platform, setPlatform] = useState<"youtube" | "instagram">("youtube");
  const [title, setTitle] = useState("Feature of the day");
  const [url, setUrl] = useState("");

  // Preview & Server State
  const [currentConfig, setCurrentConfig] = useState<FloatingAdConfig | null>(null);
  const [previewEmbedUrl, setPreviewEmbedUrl] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);

  // Client-side regex helper for instant live preview feedback
  const parseClientUrl = (inputUrl: string) => {
    if (!inputUrl.trim()) {
      setIsValidUrl(false);
      setPreviewEmbedUrl("");
      setPreviewError("");
      return;
    }

    const clean = inputUrl.trim();

    // YouTube regex
    const ytMatch = clean.match(
      /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      setPlatform("youtube");
      setIsValidUrl(true);
      setPreviewEmbedUrl(`https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&enablejsapi=1&rel=0`);
      setPreviewError("");
      return;
    }

    // Instagram regex
    const igMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p)\/([\w-]{9,})/i);
    if (igMatch && igMatch[1]) {
      setPlatform("instagram");
      setIsValidUrl(true);
      setPreviewEmbedUrl(`https://www.instagram.com/p/${igMatch[1]}/embed/`);
      setPreviewError("");
      return;
    }

    setIsValidUrl(false);
    setPreviewEmbedUrl("");
    setPreviewError("Please enter a valid YouTube (video, shorts, youtu.be) or Instagram (Reel, Post) URL.");
  };

  const fetchCurrentConfig = async () => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/floating-video-ad/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.ok) {
        const data: FloatingAdConfig = await res.json();
        setCurrentConfig(data);
        setEnabled(data.enabled);
        setPlatform((data.platform as "youtube" | "instagram") || "youtube");
        setTitle(data.title || "Feature of the day");
        setUrl(data.url || "");
        parseClientUrl(data.url || "");
      } else {
        toast.error("Failed to load floating ad configuration.");
      }
    } catch (err) {
      console.error("Error fetching floating ad config:", err);
      toast.error("Network error fetching configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentConfig();
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    parseClientUrl(val);
  };

  const handleSave = async (overrideEnabled?: boolean) => {
    const targetEnabled = overrideEnabled !== undefined ? overrideEnabled : enabled;

    if (targetEnabled && !url.trim()) {
      toast.error("Please enter a valid video URL before activating the advertisement.");
      return;
    }

    if (url.trim() && !isValidUrl) {
      toast.error("Please provide a valid YouTube or Instagram URL.");
      return;
    }

    setSaving(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/floating-video-ad/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          enabled: targetEnabled,
          platform,
          title: title.trim() || "Feature of the day",
          url: url.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentConfig(data);
        setEnabled(data.enabled);
        toast.success(
          data.enabled
            ? "Floating Video Advertisement updated and ACTIVATED site-wide!"
            : "Floating Video Advertisement updated and DISABLED."
        );
      } else {
        toast.error(data.error || "Failed to save advertisement settings.");
      }
    } catch (err) {
      console.error("Error saving ad settings:", err);
      toast.error("Server error while saving advertisement.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = !enabled;
    setEnabled(newStatus);
    await handleSave(newStatus);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="h-64 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">play_circle</span>
            Floating Video Advertisement
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage the global floating video ad displayed across all public pages of Jalgaon.com.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Status:</span>
          <button
            onClick={handleToggleStatus}
            disabled={saving}
            className={`px-4 py-2 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all duration-200 flex items-center gap-2 ${
              enabled
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${enabled ? "bg-white animate-ping" : "bg-slate-400"}`}></span>
            {enabled ? "ACTIVE" : "DISABLED"}
          </button>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Platform Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as "youtube" | "instagram")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
            >
              <option value="youtube">YouTube (Video / Shorts / YouTu.be)</option>
              <option value="instagram">Instagram (Reel / Post)</option>
            </select>
          </div>

          {/* Video Title / Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Video Name / Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Feature of the day / Ganesh Pandal Special"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
            />
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Video / Reel URL</label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="e.g. https://www.youtube.com/watch?v=XXXXXXXX"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400">link</span>
            </div>
          </div>
        </div>

        {/* Live Preview Section */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500 text-lg">preview</span>
              Live Advertisement Preview
            </h3>
            {isValidUrl && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Valid {platform === "youtube" ? "YouTube" : "Instagram"} URL
              </span>
            )}
          </div>

          {isValidUrl && previewEmbedUrl ? (
            <div className="flex justify-center bg-black/90 rounded-xl p-4 overflow-hidden min-h-[250px] max-w-sm mx-auto shadow-inner relative">
              {platform === "youtube" ? (
                <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-700 shadow-xl">
                  <iframe
                    src={previewEmbedUrl}
                    title="Ad Preview"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="w-full max-w-[320px] aspect-[9/16] max-h-[380px] rounded-lg overflow-hidden border border-slate-700 shadow-xl">
                  <iframe
                    src={previewEmbedUrl}
                    title="Instagram Reel Preview"
                    className="w-full h-full border-0 bg-white"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-300 rounded-xl bg-white space-y-2">
              <span className="material-symbols-outlined text-4xl text-slate-400">videocam_off</span>
              <p className="text-sm font-medium text-slate-600">
                {previewError || "Paste a valid YouTube or Instagram URL above to preview the advertisement."}
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer"
          >
            Save & Disable
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || !isValidUrl}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              isValidUrl && !saving
                ? "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90 cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span className="material-symbols-outlined text-lg">save</span>
            {saving ? "Saving..." : "Save & Activate Advertisement"}
          </button>
        </div>
      </div>

      {/* Currently Active Ad Card */}
      {currentConfig && (
        <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-amber-400">campaign</span>
                Currently Configured Advertisement
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Non-database configuration persisted on server.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                currentConfig.enabled ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
              }`}
            >
              {currentConfig.enabled ? "LIVE ON WEBSITE" : "DISABLED"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-300">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Platform</span>
              <span className="font-semibold text-white capitalize">{currentConfig.platform || "Not set"}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Video Name</span>
              <span className="font-semibold text-white truncate block">{currentConfig.title || "Feature of the day"}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Last Updated</span>
              <span className="font-medium">
                {currentConfig.updated_at
                  ? new Date(currentConfig.updated_at).toLocaleString("en-IN")
                  : "Never"}
              </span>
            </div>
            <div className="sm:col-span-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Target URL</span>
              <a
                href={currentConfig.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-400 hover:underline break-all font-mono bg-slate-800/80 px-3 py-2 rounded-lg block border border-slate-700/50"
              >
                {currentConfig.url || "No URL currently configured."}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
