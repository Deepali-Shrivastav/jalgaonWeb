"use client";

import React, { useState, useEffect } from "react";

interface Claim { id: number; business_name: string; user_name: string; user_phone: string; contact_number: string; message: string; created_at: string; status: string; }

export default function AdminClaimsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [statusMsg, setStatusMsg] = useState("");

  const fetchClaims = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/business-claims/?status=${statusFilter}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setClaims(data.results || data);
    } catch { console.error("Failed to fetch claims"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClaims(); }, [statusFilter]);

  const handleAction = async (id: number, action: string) => {
    if (!window.confirm(`Are you sure you want to ${action} this claim?`)) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/business-claims/${id}/`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const data = await res.json();
      setStatusMsg(data.message || `Claim ${action}ed.`);
      fetchClaims();
      setTimeout(() => setStatusMsg(""), 4000);
    } catch { setStatusMsg(`Error processing ${action}`); setTimeout(() => setStatusMsg(""), 4000); }
  };

  const badgeClass = (status: string) => status === "approved" ? "bg-green-100 text-green-700" : status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

  return (
    <div className="space-y-4">
      {statusMsg && <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">{statusMsg}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold">Business Claims</h3>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left"><tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Business</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Claimed By</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Message / Info</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {claims.length > 0 ? claims.map(claim => (
                  <tr key={claim.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{claim.business_name}</td>
                    <td className="px-4 py-3">{claim.user_name || "User"}<br /><span className="text-xs text-slate-400">{claim.contact_number || claim.user_phone}</span></td>
                    <td className="px-4 py-3 max-w-[250px]"><div className="whitespace-pre-wrap text-sm">{claim.message}</div></td>
                    <td className="px-4 py-3 text-slate-500">{new Date(claim.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass(claim.status)}`}>{claim.status}</span></td>
                    <td className="px-4 py-3">
                      {claim.status === "pending" && (
                        <div className="flex gap-1">
                          <button onClick={() => handleAction(claim.id, "approve")} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100 flex items-center gap-0.5"><span className="material-symbols-outlined text-sm">check</span>Approve</button>
                          <button onClick={() => handleAction(claim.id, "reject")} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100 flex items-center gap-0.5"><span className="material-symbols-outlined text-sm">close</span>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No claims found.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
