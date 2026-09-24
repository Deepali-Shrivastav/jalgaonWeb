"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AdminBanner } from "@/types/banner";

interface Counts {
  all: number;
  active: number;
  scheduled: number;
  expired: number;
  inactive: number;
}

export default function AdminBannersPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab & Status Query Params State
  const tabParam = searchParams ? searchParams.get("tab") : null;
  const statusParam = searchParams ? searchParams.get("status") : null;

  const [activeTab, setActiveTab] = useState<"list" | "create">(
    tabParam === "create" ? "create" : "list"
  );
  const [statusFilter, setStatusFilter] = useState<string>(
    statusParam
      ? statusParam.toUpperCase()
      : tabParam === "history"
      ? "EXPIRED"
      : "ALL"
  );

  useEffect(() => {
    if (tabParam === "create") {
      setActiveTab("create");
    } else {
      setActiveTab("list");
    }

    if (statusParam) {
      setStatusFilter(statusParam.toUpperCase());
    } else if (tabParam === "history") {
      setStatusFilter("EXPIRED");
    } else if (tabParam === "list") {
      setStatusFilter("ALL");
    }
  }, [tabParam, statusParam]);

  // Data & Filter State
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [counts, setCounts] = useState<Counts>({
    all: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
    inactive: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Edit / Form State
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formClientName, setFormClientName] = useState("");
  const [formWebsiteUrl, setFormWebsiteUrl] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formExpiryDate, setFormExpiryDate] = useState("");
  const [formIsEnabled, setFormIsEnabled] = useState(true);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");

  // Modal State for Viewing Preview
  const [previewModalBanner, setPreviewModalBanner] = useState<AdminBanner | null>(null);

  // Helper to format date YYYY-MM-DD
  const formatDateForInput = (d: Date) => {
    return d.toISOString().split("T")[0];
  };

  // Reset form
  const resetForm = () => {
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 30);

    setEditingBannerId(null);
    setFormClientName("");
    setFormWebsiteUrl("");
    setFormStartDate(formatDateForInput(today));
    setFormExpiryDate(formatDateForInput(future));
    setFormIsEnabled(true);
    setSelectedFile(null);
    setImagePreviewUrl("");
    setExistingImageUrl("");
  };

  const fetchBanners = async () => {
    setLoading(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      let url = `${baseUrl}/api/v1/admin-panel/banners/?status=${statusFilter}`;
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
        setBanners(data.banners || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      } else {
        toast.error("Failed to load banners.");
      }
    } catch (err) {
      console.error("Error fetching banners:", err);
      toast.error("Network error fetching banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [statusFilter]);

  // Handle Image File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (max 1MB)
      if (file.size > 1 * 1024 * 1024) {
        toast.error("Banner image file size cannot exceed 1MB.");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }

      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  // Quick Preset Duration
  const applyPresetDuration = (days: number) => {
    const start = formStartDate ? new Date(formStartDate) : new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    setFormExpiryDate(formatDateForInput(end));
  };

  const handleStartEdit = (banner: AdminBanner) => {
    setEditingBannerId(banner.id);
    setFormClientName(banner.client_name || "");
    setFormWebsiteUrl(banner.website_url || "");
    setFormStartDate(banner.start_date || formatDateForInput(new Date()));
    setFormExpiryDate(banner.expiry_date || formatDateForInput(new Date()));
    setFormIsEnabled(banner.is_enabled);
    setExistingImageUrl(banner.banner_image || "");
    setSelectedFile(null);
    setImagePreviewUrl("");
    setActiveTab("create");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formClientName.trim()) {
      toast.error("Client / Business Name is required.");
      return;
    }

    if (!editingBannerId && !selectedFile) {
      toast.error("Please upload a banner image.");
      return;
    }

    if (!formStartDate || !formExpiryDate) {
      toast.error("Both Start Date and Expiry Date are required.");
      return;
    }

    if (new Date(formStartDate) > new Date(formExpiryDate)) {
      toast.error("Start Date cannot be after Expiry Date.");
      return;
    }

    setSaving(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      const isEdit = editingBannerId !== null;
      const endpoint = isEdit
        ? `${baseUrl}/api/v1/admin-panel/banners/${editingBannerId}/`
        : `${baseUrl}/api/v1/admin-panel/banners/`;

      const method = isEdit ? "PATCH" : "POST";

      const formData = new FormData();
      formData.append("client_name", formClientName.trim());
      formData.append("website_url", formWebsiteUrl.trim());
      formData.append("start_date", formStartDate);
      formData.append("expiry_date", formExpiryDate);
      formData.append("is_enabled", formIsEnabled ? "true" : "false");

      if (selectedFile) {
        formData.append("banner_image", selectedFile);
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          isEdit
            ? "Banner updated successfully!"
            : "New banner added successfully!"
        );
        resetForm();
        setActiveTab("list");
        fetchBanners();
      } else {
        const errMsg =
          data.error ||
          (data.website_url ? data.website_url[0] : null) ||
          (data.expiry_date ? data.expiry_date[0] : null) ||
          "Failed to save banner.";
        toast.error(errMsg);
      }
    } catch (err) {
      console.error("Error saving banner:", err);
      toast.error("Server error while saving banner.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (bannerId: number) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(
        `${baseUrl}/api/v1/admin-panel/banners/${bannerId}/toggle/`,
        {
          method: "PATCH",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || "Status updated.");
        fetchBanners();
      } else {
        toast.error("Failed to toggle status.");
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error("Server error toggling banner status.");
    }
  };

  const handleDelete = async (bannerId: number, clientName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete banner for "${clientName}"?`
      )
    ) {
      return;
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(
        `${baseUrl}/api/v1/admin-panel/banners/${bannerId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (res.ok) {
        toast.success("Banner deleted successfully.");
        fetchBanners();
      } else {
        toast.error("Failed to delete banner.");
      }
    } catch (err) {
      console.error("Error deleting banner:", err);
      toast.error("Server error deleting banner.");
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
      case "INACTIVE":
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            INACTIVE
          </span>
        );
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">
              view_carousel
            </span>
            Banner Management System
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage promotional client banners displayed across the public homepage with automated date scheduling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeTab === "create") {
                resetForm();
                setActiveTab("list");
              } else {
                resetForm();
                setActiveTab("create");
              }
            }}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">
              {activeTab === "create" ? "list" : "add"}
            </span>
            {activeTab === "create" ? "View All Banners" : "Add New Banner"}
          </button>
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
                { label: "INACTIVE", value: "INACTIVE", count: counts.inactive },
              ].map((pill) => {
                const isSelected = statusFilter === pill.value;
                return (
                  <button
                    key={pill.value}
                    onClick={() => setStatusFilter(pill.value)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-primary text-white shadow-sm shadow-primary/20"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-300/70 text-slate-800"
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
                placeholder="Search client, title, URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchBanners()}
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
              <div className="h-16 bg-slate-100 rounded"></div>
              <div className="h-16 bg-slate-100 rounded"></div>
              <div className="h-16 bg-slate-100 rounded"></div>
            </div>
          ) : banners.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-slate-400">
                view_carousel
              </span>
              <h3 className="text-base font-bold text-slate-800">
                No Banners Found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                There are no banners matching your current filter criteria. Click "+ Add New Banner" to create one.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab("create");
                }}
                className="mt-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Create First Banner
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Banner & Client</th>
                      <th className="py-3 px-4">Destination URL</th>
                      <th className="py-3 px-4">Schedule Period</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Clicks / CTR</th>
                      <th className="py-3 px-4">Enabled</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {banners.map((banner) => (
                      <tr
                        key={banner.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Banner Image & Client */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3.5">
                            <div className="group relative w-28 h-16 rounded-md overflow-hidden border border-slate-200/90 bg-slate-100 flex-shrink-0 shadow-xs hover:shadow-md transition-all">
                              <img
                                src={banner.banner_image}
                                alt={banner.client_name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 text-sm">
                                {banner.client_name}
                              </div>
                              {banner.title && (
                                <div className="text-xs text-slate-500 line-clamp-1 font-medium">
                                  {banner.title}
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400 font-medium">
                                By: {banner.created_by_name || "Admin"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Destination URL */}
                        <td className="py-3.5 px-4">
                          {banner.website_url ? (
                            <a
                              href={banner.website_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:text-primary-deep truncate max-w-[180px] flex items-center gap-1 font-medium underline"
                            >
                              {banner.website_url}
                              <span className="material-symbols-outlined text-xs">
                                open_in_new
                              </span>
                            </a>
                          ) : (
                            <span className="text-slate-400 font-medium">None</span>
                          )}
                        </td>

                        {/* Schedule Period */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">
                            {banner.start_date} → {banner.expiry_date}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">{getStatusBadge(banner.status)}</td>

                        {/* Clicks & CTR */}
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          <div>{banner.clicks} Clicks</div>
                          <div className="text-[10px] text-slate-400">
                            {banner.ctr}% CTR ({banner.impressions} Views)
                          </div>
                        </td>

                        {/* Toggle Enable */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(banner.id)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                              banner.is_enabled ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                                banner.is_enabled ? "translate-x-5" : "translate-x-0"
                              }`}
                            ></div>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewModalBanner(banner)}
                              title="Preview"
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-lg">
                                visibility
                              </span>
                            </button>

                            <button
                              onClick={() => handleStartEdit(banner)}
                              title="Edit"
                              className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-lg">
                                edit
                              </span>
                            </button>

                            <button
                              onClick={() => handleDelete(banner.id, banner.client_name)}
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
                  {editingBannerId ? "edit_note" : "post_add"}
                </span>
                {editingBannerId
                  ? `Edit Banner #${editingBannerId}`
                  : "Add New Client Banner"}
              </h2>
              {editingBannerId && (
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
              {/* Client / Business Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Client / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formClientName}
                  onChange={(e) => setFormClientName(e.target.value)}
                  placeholder="e.g. Acme Gold Jewellers"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Destination Website URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Destination Website URL (Optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formWebsiteUrl}
                    onChange={(e) => setFormWebsiteUrl(e.target.value)}
                    placeholder="e.g. https://www.clientwebsite.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-lg">
                    link
                  </span>
                </div>
              </div>

              {/* Banner Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Banner Image Asset *
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                  {(imagePreviewUrl || existingImageUrl) && (
                    <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-200 bg-black flex-shrink-0 relative">
                      <img
                        src={imagePreviewUrl || existingImageUrl}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      id="banner-file-input"
                      className="hidden"
                    />
                    <label
                      htmlFor="banner-file-input"
                      className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg shadow-xs hover:bg-slate-100 transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">
                        upload_file
                      </span>
                      {selectedFile
                        ? "Change Image File"
                        : existingImageUrl
                        ? "Replace Existing Image"
                        : "Upload Banner Graphic"}
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Recommended resolution: 1600x600 px or 21:9 landscape format. Max file size: 1MB.
                    </p>
                  </div>
                </div>
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

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={formExpiryDate}
                  onChange={(e) => setFormExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Quick Duration Presets */}
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
                    Enable Banner Publicly
                  </div>
                  <div className="text-xs text-slate-500">
                    If disabled, this banner will remain hidden on the public site regardless of its start and expiry date range.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFormIsEnabled(!formIsEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                    formIsEnabled ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      formIsEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab("list");
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary hover:bg-primary-deep text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving Banner...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">
                      save
                    </span>
                    {editingBannerId ? "Update Banner" : "Save & Publish Banner"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Preview Modal */}
      {previewModalBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setPreviewModalBanner(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-800 p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                visibility
              </span>
              Banner Public Card Preview
            </h3>

            <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden bg-black shadow-lg">
              <img
                src={previewModalBanner.banner_image}
                alt={previewModalBanner.client_name}
                className="w-full h-full object-cover"
              />
            </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Client:</span>{" "}
                  {previewModalBanner.client_name}
                </div>
                <div>
                  <span className="font-bold text-slate-700">Target URL:</span>{" "}
                  {previewModalBanner.website_url ? (
                    <span className="underline text-primary">
                      {previewModalBanner.website_url}
                    </span>
                  ) : (
                    <span className="text-slate-400">None</span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-slate-700">Status:</span>{" "}
                  {previewModalBanner.status}
                </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
