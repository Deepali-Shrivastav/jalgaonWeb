"use client";

import React, { useState, useEffect } from "react";

interface Report { id: number; business_name: string; reporter_name: string; reporter_phone: string; reason: string; description: string; created_at: string; status: string; }

export default function AdminReportsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [statusMsg, setStatusMsg] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/business-reports/?status=${statusFilter}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setReports(data.results || data);
    } catch { console.error("Failed to fetch reports"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, [statusFilter]);

  const handleAction = async (id: number, action: string) => {
    if (!window.confirm(`Are you sure you want to ${action} this report?`)) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/business-reports/${id}/`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const data = await res.json();
      setStatusMsg(data.message || `Report ${action}d.`);
      fetchReports();
      setTimeout(() => setStatusMsg(""), 4000);
    } catch { setStatusMsg(`Error processing ${action}`); setTimeout(() => setStatusMsg(""), 4000); }
  };

  const badgeClass = (status: string) => status === "resolved" ? "bg-green-100 text-green-700" : status === "dismissed" ? "bg-slate-100 text-slate-600" : "bg-yellow-100 text-yellow-700";

  return (
    <div className="space-y-4">
      {statusMsg && <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">{statusMsg}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold">Business Reports</h3>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <option value="pending">Pending</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left"><tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Business</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Reported By</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Reason</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {reports.length > 0 ? reports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{report.business_name}</td>
                    <td className="px-4 py-3">{report.reporter_name}<br /><span className="text-xs text-slate-400">{report.reporter_phone}</span></td>
                    <td className="px-4 py-3"><strong>{report.reason}</strong>{report.description && <><br /><span className="text-sm">{report.description}</span></>}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(report.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass(report.status)}`}>{report.status}</span></td>
                    <td className="px-4 py-3">
                      {report.status === "pending" && (
                        <div className="flex gap-1">
                          <button onClick={() => handleAction(report.id, "resolve")} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100 flex items-center gap-0.5"><span className="material-symbols-outlined text-sm">check</span>Resolve</button>
                          <button onClick={() => handleAction(report.id, "dismiss")} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium hover:bg-slate-200 flex items-center gap-0.5"><span className="material-symbols-outlined text-sm">close</span>Dismiss</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No reports found.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
