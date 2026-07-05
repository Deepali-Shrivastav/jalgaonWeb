"use client";

import React, { useState, useEffect } from "react";

interface Ad { id: number; name: string; ad_type: string; contact_number: string; contact_email: string; status: string; created_at: string; ad_image: string; }

export default function AdminAdsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [statusMsg, setStatusMsg] = useState("");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<Ad | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [targetRejectId, setTargetRejectId] = useState<number | null>(null);

  const fetchAds = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/ads/?status=${statusFilter}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAds(data.results || data);
    } catch (error) { console.error("Failed to fetch ads", error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAds(); }, [statusFilter]);

  const handleAction = async (id: number, action: string, reason = "") => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/ads/${id}/`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ action, rejection_reason: reason }) });
      const data = await res.json();
      setStatusMsg(data.message || `Ad ${action}d`);
      fetchAds();
      setTimeout(() => setStatusMsg(""), 3000);
    } catch { setStatusMsg(`Error processing ${action}`); setTimeout(() => setStatusMsg(""), 3000); }
  };

  const openRejectModal = (id: number) => { setTargetRejectId(id); setRejectionReason(""); setRejectModalOpen(true); };
  const submitReject = () => { if (targetRejectId) handleAction(targetRejectId, "reject", rejectionReason); setRejectModalOpen(false); };

  const badgeClass = (status: string) => status === "active" ? "bg-green-100 text-green-700" : status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

  return (
    <div className="space-y-4">
      {statusMsg && <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">{statusMsg}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ads Moderation Queue</h2>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <option value="">All Statuses</option><option value="pending">Pending</option><option value="active">Active</option><option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left"><tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Ad Title</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Type</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Contact</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {ads.length > 0 ? ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{ad.name}</td>
                    <td className="px-4 py-3">{ad.ad_type === "BA" ? "Banner Ad" : "Carousel Ad"}</td>
                    <td className="px-4 py-3">{ad.contact_number}<br /><span className="text-xs text-slate-400">{ad.contact_email}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass(ad.status)}`}>{ad.status === "active" ? "Active" : ad.status === "rejected" ? "Rejected" : "Pending"}</span></td>
                    <td className="px-4 py-3 text-slate-500">{new Date(ad.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setPreviewData(ad); setPreviewModalOpen(true); }} className="p-1.5 rounded hover:bg-slate-100" title="Preview"><span className="material-symbols-outlined text-lg text-slate-500">image</span></button>
                        {ad.status !== "active" && <button onClick={() => handleAction(ad.id, "approve")} className="p-1.5 rounded hover:bg-green-50" title="Approve"><span className="material-symbols-outlined text-lg text-green-600">check_circle</span></button>}
                        {ad.status !== "rejected" && <button onClick={() => openRejectModal(ad.id)} className="p-1.5 rounded hover:bg-red-50" title="Reject"><span className="material-symbols-outlined text-lg text-red-500">cancel</span></button>}
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No advertisements found.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-[500px] mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Advertisement</h3>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} className="w-full p-3 border border-slate-200 rounded-lg text-sm mb-4" placeholder="Reason for rejection..." />
            <div className="flex justify-end gap-3">
              <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
              <button onClick={submitReject} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">Reject</button>
            </div>
          </div>
        </div>
      )}

      {previewModalOpen && previewData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl w-full max-w-[800px] mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{previewData.name} ({previewData.ad_type === "BA" ? "Banner Ad" : "Carousel Ad"})</h2>
              <button onClick={() => setPreviewModalOpen(false)} className="p-1 hover:bg-slate-100 rounded"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="text-center"><img src={previewData.ad_image.startsWith("http") ? previewData.ad_image : `${baseUrl}${previewData.ad_image}`} alt="Ad Preview" className="max-w-full max-h-[60vh] object-contain rounded-lg border border-slate-200 mx-auto" /></div>
          </div>
        </div>
      )}
    </div>
  );
}
