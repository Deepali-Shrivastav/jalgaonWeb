"use client";

import React, { useState, useEffect } from "react";

interface ModerationItem { id: number; content_type_name: string; content_preview: { error?: string; name?: string; address?: string } | null; submitted_by_phone: string; submitted_at: string; status: string; }

export default function AdminModerationPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const [queue, setQueue] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [statusMsg, setStatusMsg] = useState("");

  const fetchQueue = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/moderation/?status=${statusFilter}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setQueue(data.results || data);
    } catch { console.error("Failed to fetch moderation queue"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQueue(); }, [statusFilter]);

  const handleAction = async (id: number, action: string) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${baseUrl}/api/v1/admin-panel/moderation/${id}/`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      setStatusMsg(`Item ${action}ed successfully.`);
      fetchQueue();
      setTimeout(() => setStatusMsg(""), 3000);
    } catch { setStatusMsg(`Error processing ${action}`); setTimeout(() => setStatusMsg(""), 3000); }
  };

  const badgeClass = (status: string) => status === "approved" ? "bg-green-100 text-green-700" : status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

  return (
    <div className="space-y-4">
      {statusMsg && <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">{statusMsg}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold">Global Moderation Queue</h3>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <option value="pending">Pending Review</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left"><tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Content Type</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Preview</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Submitted By</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {queue.length > 0 ? queue.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 capitalize">{item.content_type_name}</td>
                    <td className="px-4 py-3">{item.content_preview?.error ? <span className="text-red-500">Content missing</span> : <><strong>{item.content_preview?.name || "N/A"}</strong>{item.content_preview?.address && <><br /><span className="text-xs text-slate-400">{item.content_preview.address}</span></>}</>}</td>
                    <td className="px-4 py-3">{item.submitted_by_phone}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(item.submitted_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass(item.status)}`}>{item.status}</span></td>
                    <td className="px-4 py-3">
                      {item.status === "pending" && (
                        <div className="flex gap-1">
                          <button onClick={() => handleAction(item.id, "approve")} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100 flex items-center gap-0.5"><span className="material-symbols-outlined text-sm">check</span>Approve</button>
                          <button onClick={() => handleAction(item.id, "reject")} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100 flex items-center gap-0.5"><span className="material-symbols-outlined text-sm">close</span>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No items in moderation queue.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
