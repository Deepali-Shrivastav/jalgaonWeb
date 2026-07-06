"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";

interface TrendingListing { id: number; business_name: string; category_name: string; is_trending: boolean; trending_priority: number; trending_until: string | null; }

export default function AdminTrendingPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const [listings, setListings] = useState<TrendingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedListing, setSelectedListing] = useState<TrendingListing | null>(null);
  const [trendingPriority, setTrendingPriority] = useState(0);
  const [trendingUntil, setTrendingUntil] = useState("");
  const [isTrending, setIsTrending] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/listings/?search=${searchTerm}&trending=true&page=${page}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setListings(data.results || data);
      if (data.count !== undefined) {
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setTotalPages(1);
      }
    } catch (error) { console.error("Failed to fetch trending listings", error); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [searchTerm]);
  useEffect(() => { const d = setTimeout(() => fetchListings(), 300); return () => clearTimeout(d); }, [searchTerm, page]);

  const openTrendingModal = (listing: TrendingListing) => {
    setSelectedListing(listing);
    setIsTrending(listing.is_trending || true);
    setTrendingPriority(listing.trending_priority || 0);
    setTrendingUntil(listing.trending_until ? new Date(listing.trending_until).toISOString().split("T")[0] : "");
    setIsModalOpen(true);
  };

  const handleSaveTrending = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${baseUrl}/api/v1/admin-panel/listings/${selectedListing.id}/trending/`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ is_trending: isTrending, trending_priority: trendingPriority, trending_until: trendingUntil ? new Date(trendingUntil).toISOString() : null }),
      });
      setStatusMsg("Trending status updated successfully.");
      fetchListings();
      setIsModalOpen(false);
      setTimeout(() => setStatusMsg(""), 3000);
    } catch { setStatusMsg("Error updating trending status"); setTimeout(() => setStatusMsg(""), 3000); }
  };

  const handleRemoveTrending = async (id: number) => {
    if (!window.confirm("Remove this business from trending?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${baseUrl}/api/v1/admin-panel/listings/${id}/trending/`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ is_trending: false, trending_priority: 0, trending_until: null }),
      });
      setStatusMsg("Removed from trending.");
      fetchListings();
      setTimeout(() => setStatusMsg(""), 3000);
    } catch { setStatusMsg("Error removing trending status."); setTimeout(() => setStatusMsg(""), 3000); }
  };

  return (
    <div className="space-y-4">
      {statusMsg && <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">{statusMsg}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="relative flex-1 max-w-[400px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input type="text" placeholder="Search trending..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <span className="text-sm text-slate-500"><strong>{listings.length}</strong> Active Trending</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left"><tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Business Name</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Category</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Priority</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Trending Until</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {listings.length > 0 ? listings.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{l.business_name}</td>
                    <td className="px-4 py-3">{l.category_name}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-200">{l.trending_priority}</span></td>
                    <td className="px-4 py-3">{l.trending_until ? new Date(l.trending_until).toLocaleDateString() : "Indefinite"}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openTrendingModal(l)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100 flex items-center gap-1"><span className="material-symbols-outlined text-sm">edit</span>Edit</button>
                      <button onClick={() => handleRemoveTrending(l.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100 flex items-center gap-1"><span className="material-symbols-outlined text-sm">close</span>Remove</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No trending listings found.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
        
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      </div>

      {isModalOpen && selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-[500px] mx-4">
            <h3 className="text-lg font-semibold mb-4">Manage Trending: {selectedListing.business_name}</h3>
            <form onSubmit={handleSaveTrending} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                <select value={String(isTrending)} onChange={(e) => setIsTrending(e.target.value === "true")} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                  <option value="true">Trending Enabled</option><option value="false">Trending Disabled</option>
                </select></div>
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Priority (Higher = Top)</label>
                <input type="number" value={trendingPriority} onChange={(e) => setTrendingPriority(parseInt(e.target.value) || 0)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Trending Until (Optional)</label>
                <input type="date" value={trendingUntil} onChange={(e) => setTrendingUntil(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
