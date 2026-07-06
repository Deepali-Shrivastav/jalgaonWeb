"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";

interface Listing { id: number; business_name: string; business_address: string; category_name: string; owner_name: string; owner_phone: string; status: string; business_banner?: string; business_no?: string; business_email?: string; city?: string; business_dob?: string; business_gst?: string; business_description?: string; main_category_name?: string; sub_category_name?: string; is_trending?: boolean; }

export default function AdminListingsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [targetRejectId, setTargetRejectId] = useState<number | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<Listing | null>(null);
  
  // Trending Modal State
  const [trendingModalOpen, setTrendingModalOpen] = useState(false);
  const [targetTrendingListing, setTargetTrendingListing] = useState<Listing | null>(null);
  const [trendingPriority, setTrendingPriority] = useState(0);
  const [trendingUntil, setTrendingUntil] = useState("");

  const fetchListings = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/listings/?search=${searchTerm}&status=${statusFilter}&page=${page}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setListings(data.results || data);
      setSelectedIds([]);
      if (data.count !== undefined) {
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setTotalPages(1);
      }
    } catch (error) { console.error("Failed to fetch listings", error); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [searchTerm, statusFilter]);
  useEffect(() => { const d = setTimeout(() => fetchListings(), 300); return () => clearTimeout(d); }, [searchTerm, statusFilter, page]);

  const handleAction = async (id: number, action: string, reason = "") => {
    if (action === "delete" && !window.confirm("Are you sure you want to delete this listing?")) return;
    const token = localStorage.getItem("token");
    try {
      if (action === "delete") {
        await fetch(`${baseUrl}/api/v1/admin-panel/listings/${id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        setStatusMsg("Listing deleted successfully");
      } else {
        const res = await fetch(`${baseUrl}/api/v1/admin-panel/listings/${id}/`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ action, rejection_reason: reason }) });
        const data = await res.json();
        setStatusMsg(data.message || `Listing ${action}d`);
      }
      fetchListings();
      setTimeout(() => setStatusMsg(""), 3000);
    } catch { setStatusMsg(`Error processing ${action}`); setTimeout(() => setStatusMsg(""), 3000); }
  };

  const handleBulkAction = async (action: string, reason = "") => {
    if (selectedIds.length === 0) return;
    if (action === "delete" && !window.confirm(`Delete ${selectedIds.length} listings?`)) return;
    const token = localStorage.getItem("token");
    setLoading(true);
    let successCount = 0;
    for (const id of selectedIds) {
      try {
        if (action === "delete") { await fetch(`${baseUrl}/api/v1/admin-panel/listings/${id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); }
        else { await fetch(`${baseUrl}/api/v1/admin-panel/listings/${id}/`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ action, rejection_reason: reason }) }); }
        successCount++;
      } catch { /* skip */ }
    }
    setStatusMsg(`Processed ${successCount} of ${selectedIds.length} items.`);
    fetchListings();
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const openRejectModal = (id: number | null = null) => { setTargetRejectId(id); setRejectionReason(""); setRejectModalOpen(true); };
  const submitReject = () => { if (targetRejectId) handleAction(targetRejectId, "reject", rejectionReason); else handleBulkAction("reject", rejectionReason); setRejectModalOpen(false); };

  const openTrendingModal = (listing: Listing) => {
    setTargetTrendingListing(listing);
    setTrendingPriority(0);
    setTrendingUntil("");
    setTrendingModalOpen(true);
  };

  const submitTrending = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTrendingListing) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${baseUrl}/api/v1/admin-panel/listings/${targetTrendingListing.id}/trending/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          is_trending: true,
          trending_priority: trendingPriority,
          trending_until: trendingUntil ? new Date(trendingUntil).toISOString() : null
        })
      });
      setStatusMsg(`Added ${targetTrendingListing.business_name} to trending!`);
      setTrendingModalOpen(false);
      setTimeout(() => setStatusMsg(""), 3000);
      fetchListings();
    } catch {
      setStatusMsg("Error marking as trending");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const handleRemoveTrending = async (id: number) => {
    if (!window.confirm("Remove from trending?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${baseUrl}/api/v1/admin-panel/listings/${id}/trending/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          is_trending: false,
          trending_priority: 0,
          trending_until: null
        })
      });
      setStatusMsg("Removed from trending.");
      setTimeout(() => setStatusMsg(""), 3000);
      fetchListings();
    } catch {
      setStatusMsg("Error removing from trending");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const openPreview = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/listings/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      setPreviewData(await res.json());
      setPreviewModalOpen(true);
    } catch { setStatusMsg("Failed to load preview"); setTimeout(() => setStatusMsg(""), 3000); }
  };

  const toggleSelection = (id: number) => { setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); };
  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedIds(e.target.checked ? listings.map(l => l.id) : []); };

  const badgeClass = (status: string) => status === "active" ? "bg-green-100 text-green-700" : status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedListings = React.useMemo(() => {
    if (!sortConfig) return listings;
    return [...listings].sort((a: any, b: any) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [listings, sortConfig]);

  return (
    <div className="space-y-4">
      {statusMsg && <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">{statusMsg}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-[400px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input type="text" placeholder="Search business name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">All Statuses</option><option value="pending">Pending</option><option value="active">Active</option><option value="rejected">Rejected</option>
          </select>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-500">{selectedIds.length} selected</span>
              <button onClick={() => handleBulkAction("approve")} className="px-3 py-1.5 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600">Bulk Approve</button>
              <button onClick={() => openRejectModal(null)} className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200">Bulk Reject</button>
              <button onClick={() => handleBulkAction("delete")} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-xs font-medium hover:bg-slate-200">Bulk Delete</button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left"><tr>
                <th className="px-4 py-3 w-10"><input type="checkbox" onChange={toggleSelectAll} checked={listings.length > 0 && selectedIds.length === listings.length} /></th>
                <th className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('business_name')}>
                  <div className="flex items-center gap-1">Business Name <span className="material-symbols-outlined text-[16px] text-slate-400">{sortConfig?.key === 'business_name' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('category_name')}>
                  <div className="flex items-center gap-1">Category <span className="material-symbols-outlined text-[16px] text-slate-400">{sortConfig?.key === 'category_name' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('owner_name')}>
                  <div className="flex items-center gap-1">Owner <span className="material-symbols-outlined text-[16px] text-slate-400">{sortConfig?.key === 'owner_name' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status <span className="material-symbols-outlined text-[16px] text-slate-400">{sortConfig?.key === 'status' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {sortedListings.length > 0 ? sortedListings.map((l) => (
                  <tr key={l.id} className={`hover:bg-slate-50 ${selectedIds.includes(l.id) ? "bg-blue-50" : ""}`}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(l.id)} onChange={() => toggleSelection(l.id)} /></td>
                    <td className="px-4 py-3"><strong>{l.business_name}</strong><br /><span className="text-xs text-slate-400">{l.business_address}</span></td>
                    <td className="px-4 py-3">{l.category_name}</td>
                    <td className="px-4 py-3">{l.owner_name}<br /><span className="text-xs text-slate-400">{l.owner_phone}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass(l.status)}`}>{l.status === "active" ? "Active" : l.status === "rejected" ? "Rejected" : "Pending"}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openPreview(l.id)} className="p-1.5 rounded hover:bg-slate-100" title="Preview"><span className="material-symbols-outlined text-lg text-slate-500">visibility</span></button>
                        {l.status !== "active" && <button onClick={() => handleAction(l.id, "approve")} className="p-1.5 rounded hover:bg-green-50" title="Approve"><span className="material-symbols-outlined text-lg text-green-600">check_circle</span></button>}
                        {l.status === "active" && (
                          <button 
                            onClick={() => !l.is_trending ? openTrendingModal(l) : handleRemoveTrending(l.id)} 
                            className={`p-1.5 rounded ${l.is_trending ? 'hover:bg-yellow-50 bg-yellow-50/30' : 'hover:bg-slate-100'}`} 
                            title={l.is_trending ? "Remove from Trending" : "Make Trending"}
                          >
                            <span 
                              className={`material-symbols-outlined text-lg ${l.is_trending ? 'text-yellow-500' : 'text-slate-300'}`}
                              style={l.is_trending ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
                            >
                              star
                            </span>
                          </button>
                        )}
                        {l.status !== "rejected" && <button onClick={() => openRejectModal(l.id)} className="p-1.5 rounded hover:bg-red-50" title="Reject"><span className="material-symbols-outlined text-lg text-red-500">cancel</span></button>}
                        <button onClick={() => handleAction(l.id, "delete")} className="p-1.5 rounded hover:bg-red-50" title="Delete"><span className="material-symbols-outlined text-lg text-red-400">delete</span></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-5xl mb-2 text-slate-300">store_off</span>
                        <p className="font-medium text-slate-500 text-base">No listings found</p>
                        <p className="text-sm mt-1">Try adjusting your filters or search query</p>
                      </div>
                    </td>
                  </tr>
                )}
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

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-[500px] mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Listing{targetRejectId ? "" : "s (Bulk)"}</h3>
            <p className="text-sm text-slate-500 mb-3">Provide a reason for rejection (optional).</p>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 mb-4" placeholder="e.g. Does not meet community guidelines..." />
            <div className="flex justify-end gap-3">
              <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
              <button onClick={submitReject} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModalOpen && previewData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-[800px] mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">Listing Preview</h2>
              <button onClick={() => setPreviewModalOpen(false)} className="p-1 hover:bg-slate-100 rounded"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              {previewData.business_banner && <img src={previewData.business_banner.startsWith("http") ? previewData.business_banner : `${baseUrl}${previewData.business_banner}`} alt="Banner" className="w-full h-48 object-cover rounded-lg" />}
              <h1 className="text-2xl font-bold">{previewData.business_name}</h1>
              <p className="text-primary font-semibold">{previewData.main_category_name} {previewData.sub_category_name ? `> ${previewData.sub_category_name}` : ""}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><h4 className="font-semibold text-slate-500 mb-1">Contact</h4><p>Phone: {previewData.business_no}</p><p>Email: {previewData.business_email}</p><p>Address: {previewData.business_address}, {previewData.city}</p></div>
                <div><h4 className="font-semibold text-slate-500 mb-1">Details</h4><p>Status: <span className="uppercase">{previewData.status}</span></p><p>Established: {previewData.business_dob}</p><p>GST: {previewData.business_gst}</p></div>
              </div>
              <div><h4 className="font-semibold text-slate-500 mb-1">Description</h4><p className="text-sm bg-slate-50 p-4 rounded-lg leading-relaxed">{previewData.business_description}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Trending Modal */}
      {trendingModalOpen && targetTrendingListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-[500px] mx-4">
            <h3 className="text-lg font-semibold mb-4">Make Trending: {targetTrendingListing.business_name}</h3>
            <form onSubmit={submitTrending} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Priority (Higher = Top)</label>
                <input type="number" value={trendingPriority} onChange={(e) => setTrendingPriority(parseInt(e.target.value) || 0)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Trending Until (Optional)</label>
                <input type="date" value={trendingUntil} onChange={(e) => setTrendingUntil(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setTrendingModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90">Make Trending</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
