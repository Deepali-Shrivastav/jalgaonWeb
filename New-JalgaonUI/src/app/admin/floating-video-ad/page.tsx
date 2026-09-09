"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface FloatingAdItem {
  id: number;
  title: string;
  platform: "youtube" | "instagram" | string;
  video_url: string;
  start_date: string;
  end_date: string;
  is_enabled: boolean;
  status: "ACTIVE" | "SCHEDULED" | "EXPIRED" | "DISABLED" | string;
  embed_url?: string;
  video_id?: string;
  parsed_platform?: string;
  created_at?: string;
  updated_at?: string;
}

interface Counts {
  all: number;
  active: number;
  scheduled: number;
  expired: number;
  disabled: number;
}

export default function AdminFloatingVideoAdPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab State: 'list' | 'create'
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"list" | "create">(
    tabParam === "create" ? "create" : "list"
  );

  useEffect(() => {
    if (tabParam === "create") {
      setActiveTab("create");
    } else {
      setActiveTab("list");
    }
  }, [tabParam]);

  // Data & Filter State
  const [ads, setAds] = useState<FloatingAdItem[]>([]);
  const [counts, setCounts] = useState<Counts>({
    all: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
    disabled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Edit / Form State
  const [editingAdId, setEditingAdId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formTitle, setFormTitle] = useState("Feature of the day");
  const [formPlatform, setFormPlatform] = useState<"youtube" | "instagram">("youtube");
  const [formUrl, setFormUrl] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formIsEnabled, setFormIsEnabled] = useState(true);

  // Live Preview State
  const [previewEmbedUrl, setPreviewEmbedUrl] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);

  // Modal State for Viewing Preview of existing ad in list
  const [previewModalAd, setPreviewModalAd] = useState<FloatingAdItem | null>(null);

  // Helper to format date YYYY-MM-DD
  const formatDateForInput = (d: Date) => {
    return d.toISOString().split("T")[0];
  };

  // Set default form dates
  const resetForm = () => {
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 30);

    setEditingAdId(null);
    setFormTitle("Feature of the day");
    setFormPlatform("youtube");
    setFormUrl("");
    setFormStartDate(formatDateForInput(today));
    setFormEndDate(formatDateForInput(future));
    setFormIsEnabled(true);
    setPreviewEmbedUrl("");
    setPreviewError("");
    setIsValidUrl(false);
  };

  // Client-side regex validator for URL and live preview
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
      setFormPlatform("youtube");
      setIsValidUrl(true);
      setPreviewEmbedUrl(
        `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&enablejsapi=1&rel=0`
      );
      setPreviewError("");
      return;
    }

    // Instagram regex
    const igMatch = clean.match(
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p)\/([\w-]{9,})/i
    );
    if (igMatch && igMatch[1]) {
      setFormPlatform("instagram");
      setIsValidUrl(true);
      setPreviewEmbedUrl(`https://www.instagram.com/p/${igMatch[1]}/embed/`);
      setPreviewError("");
      return;
    }

    setIsValidUrl(false);
    setPreviewEmbedUrl("");
    setPreviewError(
      "Please enter a valid YouTube (video, shorts, youtu.be) or Instagram (Reel, Post) URL."
    );
  };

  const fetchAds = async () => {
    setLoading(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      let url = `${baseUrl}/api/v1/admin-panel/floating-video-ad/?status=${statusFilter}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setAds(data.ads || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      } else {
        toast.error("Failed to load advertisements.");
      }
    } catch (err) {
      console.error("Error fetching floating ads:", err);
      toast.error("Network error fetching advertisements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [statusFilter]);

  // Preset Date Helper
  const applyPresetDuration = (days: number) => {
    const start = formStartDate ? new Date(formStartDate) : new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    setFormEndDate(formatDateForInput(end));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormUrl(val);
    parseClientUrl(val);
  };

  const handleStartEdit = (ad: FloatingAdItem) => {
    setEditingAdId(ad.id);
    setFormTitle(ad.title || "Feature of the day");
    setFormPlatform((ad.platform as "youtube" | "instagram") || "youtube");
    setFormUrl(ad.video_url || "");
    setFormStartDate(ad.start_date || formatDateForInput(new Date()));
    setFormEndDate(ad.end_date || formatDateForInput(new Date()));
    setFormIsEnabled(ad.is_enabled);
    parseClientUrl(ad.video_url || "");
    setActiveTab("create");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formUrl.trim()) {
      toast.error("Please enter a valid video URL.");
      return;
    }

    if (!isValidUrl) {
      toast.error("Please enter a valid YouTube or Instagram URL.");
      return;
    }

    if (!formStartDate || !formEndDate) {
      toast.error("Both Start Date and End Date are required.");
      return;
    }

    if (new Date(formStartDate) > new Date(formEndDate)) {
      toast.error("Start Date cannot be after End Date.");
      return;
    }

    setSaving(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      const isEdit = editingAdId !== null;
      const endpoint = isEdit
        ? `${baseUrl}/api/v1/admin-panel/floating-video-ad/${editingAdId}/`
        : `${baseUrl}/api/v1/admin-panel/floating-video-ad/`;

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title: formTitle.trim() || "Feature of the day",
          platform: formPlatform,
          video_url: formUrl.trim(),
          start_date: formStartDate,
          end_date: formEndDate,
          is_enabled: formIsEnabled,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          isEdit
            ? "Advertisement updated successfully!"
            : "New advertisement created successfully!"
        );
        resetForm();
        setActiveTab("list");
        fetchAds();
      } else {
        toast.error(data.error || "Failed to save advertisement.");
      }
    } catch (err) {
      console.error("Error saving ad:", err);
      toast.error("Server error while saving advertisement.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (adId: number) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(
        `${baseUrl}/api/v1/admin-panel/floating-video-ad/${adId}/toggle/`,
        {
          method: "PATCH",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (res.ok) {
        toast.success("Status toggled successfully.");
        fetchAds();
      } else {
        toast.error("Failed to toggle status.");
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error("Server error toggling status.");
    }
  };

  const handleDelete = async (adId: number, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete advertisement "${title}"?`
      )
    ) {
      return;
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(
        `${baseUrl}/api/v1/admin-panel/floating-video-ad/${adId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (res.ok) {
        toast.success("Advertisement deleted successfully.");
        fetchAds();
      } else {
        toast.error("Failed to delete advertisement.");
      }
    } catch (err) {
      console.error("Error deleting ad:", err);
      toast.error("Server error deleting advertisement.");
    }
  };

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case "ACTIVE":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            ACTIVE
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-sky-600"></span>
            SCHEDULED
          </span>
        );
      case "EXPIRED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            EXPIRED
          </span>
        );
      case "DISABLED":
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            DISABLED
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">
              video_settings
            </span>
            Floating Video Advertisement Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure multi-video promotional popups displayed across public pages with automated date scheduling.
          </p>
        </div>
      </div>

      {/* TAB 1: LIST VIEW */}
      {activeTab === "list" && (
        <div className="space-y-5">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { label: "ALL", value: "ALL", count: counts.all },
                { label: "ACTIVE", value: "ACTIVE", count: counts.active },
                { label: "SCHEDULED", value: "SCHEDULED", count: counts.scheduled },
                { label: "EXPIRED", value: "EXPIRED", count: counts.expired },
                { label: "DISABLED", value: "DISABLED", count: counts.disabled },
              ].map((pill) => {
                const isSelected = statusFilter === pill.value;
                return (
                  <button
                    key={pill.value}
                    onClick={() => setStatusFilter(pill.value)}
                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-[#0088cc] text-white shadow-sm shadow-sky-500/20"
                        : "bg-[#f0f4f9] text-[#28557b] hover:bg-[#e4ebf5]"
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[#dbe4f0] text-[#1c405e]"
                      }`}
                    >
                      {pill.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search title or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchAds()}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-base">
                search
              </span>
            </div>
          </div>

          {/* Table Container */}
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-4 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
            </div>
          ) : ads.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-slate-400">
                videocam_off
              </span>
              <h3 className="text-base font-bold text-slate-800">
                No Advertisements Found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                There are no advertisements matching your current filter criteria. Click "+ Add New Advertisement" to create one.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab("create");
                }}
                className="mt-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Create First Advertisement
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Title & Platform</th>
                      <th className="py-3 px-4">Schedule Period</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Enabled</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {ads.map((ad) => (
                      <tr
                        key={ad.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">
                            {ad.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${ad.platform === "youtube"
                                  ? "bg-red-100 text-red-700 border border-red-200"
                                  : "bg-pink-100 text-pink-700 border border-pink-200"
                                }`}
                            >
                              {ad.platform}
                            </span>
                            <a
                              href={ad.video_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-500 hover:text-primary truncate max-w-[220px] flex items-center gap-1 underline"
                            >
                              {ad.video_url}
                              <span className="material-symbols-outlined text-xs">
                                open_in_new
                              </span>
                            </a>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">
                            {ad.start_date} → {ad.end_date}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">{getStatusBadge(ad.status)}</td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(ad.id)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${ad.is_enabled ? "bg-emerald-500" : "bg-slate-300"
                              }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${ad.is_enabled ? "translate-x-5" : "translate-x-0"
                                }`}
                            ></div>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewModalAd(ad)}
                              title="Preview"
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-lg">
                                visibility
                              </span>
                            </button>

                            <button
                              onClick={() => handleStartEdit(ad)}
                              title="Edit"
                              className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-lg">
                                edit
                              </span>
                            </button>

                            <button
                              onClick={() => handleDelete(ad.id, ad.title)}
                              title="Delete"
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-lg">
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE / EDIT FORM */}
      {activeTab === "create" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  {editingAdId ? "edit_note" : "post_add"}
                </span>
                {editingAdId
                  ? `Edit Advertisement #${editingAdId}`
                  : "Create New Floating Advertisement"}
              </h2>
              {editingAdId && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab("list");
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Platform */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Platform *
                </label>
                <select
                  value={formPlatform}
                  onChange={(e) => {
                    setFormPlatform(e.target.value as "youtube" | "instagram");
                    if (formUrl) parseClientUrl(formUrl);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="youtube">YouTube (Video / Shorts / YouTu.be)</option>
                  <option value="instagram">Instagram (Reel / Post)</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Video Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Feature of the day"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Video URL */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Video / Reel URL *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={formUrl}
                    onChange={handleUrlChange}
                    placeholder="e.g. https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-lg text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 transition-all ${isValidUrl
                        ? "border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500"
                        : previewError
                          ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                          : "border-slate-200 focus:ring-primary/20 focus:border-primary"
                      }`}
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-lg">
                    link
                  </span>
                </div>
                {previewError && (
                  <p className="text-xs font-semibold text-rose-600 mt-1">
                    {previewError}
                  </p>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Quick Date Presets */}
              <div className="md:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Quick Duration Presets:
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "+7 Days", days: 7 },
                    { label: "+15 Days", days: 15 },
                    { label: "+1 Month", days: 30 },
                    { label: "+3 Months", days: 90 },
                    { label: "+6 Months", days: 180 },
                    { label: "+1 Year", days: 365 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPresetDuration(preset.days)}
                      className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Is Enabled Toggle */}
              <div className="md:col-span-2 flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Enable Advertisement
                  </div>
                  <div className="text-xs text-slate-500">
                    If disabled, this advertisement will not be shown on public pages regardless of scheduled date range.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFormIsEnabled(!formIsEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${formIsEnabled ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${formIsEnabled ? "translate-x-6" : "translate-x-0"
                      }`}
                  ></div>
                </button>
              </div>
            </div>

            {/* Live Advertisement Preview */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/70 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500 text-lg">
                    preview
                  </span>
                  Live Advertisement Preview
                </h3>
                {isValidUrl && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Valid {formPlatform === "youtube" ? "YouTube" : "Instagram"} URL
                  </span>
                )}
              </div>

              {isValidUrl && previewEmbedUrl ? (
                <div className="flex justify-center bg-slate-900 rounded-xl p-4 overflow-hidden min-h-[250px] max-w-md mx-auto shadow-sm">
                  {formPlatform === "youtube" ? (
                    <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-800 shadow-md">
                      <iframe
                        src={previewEmbedUrl}
                        title="Ad Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="w-full max-w-[320px] aspect-[9/16] max-h-[380px] rounded-lg overflow-hidden border border-slate-800 shadow-md">
                      <iframe
                        src={previewEmbedUrl}
                        title="Instagram Reel Preview"
                        className="w-full h-full border-0 bg-white"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white space-y-2">
                  <span className="material-symbols-outlined text-3xl text-slate-400">
                    videocam_off
                  </span>
                  <p className="text-sm text-slate-500 font-medium">
                    {previewError ||
                      "Paste a valid YouTube or Instagram URL above to preview the advertisement."}
                  </p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab("list");
                }}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 font-medium text-sm transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !isValidUrl}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${isValidUrl && !saving
                    ? "bg-primary text-white shadow-sm hover:bg-primary/90 cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
              >
                <span className="material-symbols-outlined text-lg">save</span>
                {saving
                  ? "Saving..."
                  : editingAdId
                    ? "Update Advertisement"
                    : "Save & Create Advertisement"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* PREVIEW MODAL FOR LIST VIEW */}
      {previewModalAd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  smart_display
                </span>
                {previewModalAd.title}
              </h3>
              <button
                onClick={() => setPreviewModalAd(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 flex justify-center">
              {previewModalAd.embed_url ? (
                previewModalAd.platform === "youtube" ? (
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-800 shadow-md">
                    <iframe
                      src={previewModalAd.embed_url}
                      title={previewModalAd.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="w-full max-w-[300px] aspect-[9/16] max-h-[380px] rounded-lg overflow-hidden border border-slate-800 shadow-md">
                    <iframe
                      src={previewModalAd.embed_url}
                      title={previewModalAd.title}
                      className="w-full h-full border-0 bg-white"
                      allowFullScreen
                    ></iframe>
                  </div>
                )
              ) : (
                <p className="text-xs text-slate-400">No embed preview available.</p>
              )}
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div>
                <strong>Schedule:</strong> {previewModalAd.start_date} → {previewModalAd.end_date}
              </div>
              <div>
                <strong>Status:</strong> {previewModalAd.status}
              </div>
              <div className="truncate">
                <strong>URL:</strong> {previewModalAd.video_url}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewModalAd(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


