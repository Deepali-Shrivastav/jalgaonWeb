"use client";

import React, { useState, useEffect } from "react";

interface Event { id: number; title: string; slug: string; venue_name: string; start_datetime: string; organizer_name: string; is_featured: boolean; status: string; rejection_reason?: string; }

export default function AdminEventsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [actionMsg, setActionMsg] = useState("");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/events/admin/events/?status=${statusFilter}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setEvents(data.results || data);
    } catch { setError("Failed to load events."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [statusFilter]);

  const handleApprove = async (id: number) => {
    const token = localStorage.getItem("token");
    try { await fetch(`${baseUrl}/api/v1/events/admin/events/${id}/approve/`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({}) }); setActionMsg("Event approved."); fetchEvents(); setTimeout(() => setActionMsg(""), 3000); } catch { alert("Failed to approve."); }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) return;
    const token = localStorage.getItem("token");
    try { await fetch(`${baseUrl}/api/v1/events/admin/events/${id}/reject/`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ rejection_reason: reason }) }); setActionMsg("Event rejected."); fetchEvents(); setTimeout(() => setActionMsg(""), 3000); } catch { alert("Failed to reject."); }
  };

  const handleToggleFeature = async (id: number) => {
    const token = localStorage.getItem("token");
    try { await fetch(`${baseUrl}/api/v1/events/admin/events/${id}/feature/`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({}) }); fetchEvents(); } catch { alert("Failed to toggle feature."); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this event permanently?")) return;
    const token = localStorage.getItem("token");
    try { await fetch(`${baseUrl}/api/v1/events/admin/events/${id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); setEvents(events.filter(e => e.id !== id)); } catch { alert("Failed to delete."); }
  };

  return (
    <div className="space-y-4">
      {actionMsg && <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">{actionMsg}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Event Moderation & Management</h2>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <option value="pending">Pending Review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div> : error ? <div className="p-4 text-red-600">{error}</div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left"><tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Event Title</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Venue</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Start Date</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Organizer</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Featured</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {events.length > 0 ? events.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3"><strong>{ev.title}</strong>{ev.rejection_reason && <div className="text-xs text-red-500 mt-0.5">Reason: {ev.rejection_reason}</div>}</td>
                    <td className="px-4 py-3">{ev.venue_name}</td>
                    <td className="px-4 py-3">{new Date(ev.start_datetime).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{ev.organizer_name}</td>
                    <td className="px-4 py-3"><button onClick={() => handleToggleFeature(ev.id)} className="p-1"><span className="material-symbols-outlined text-lg" style={{ color: ev.is_featured ? "#f59e0b" : "#cbd5e1" }}>star</span></button></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${ev.status === "approved" ? "bg-green-100 text-green-700" : ev.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{ev.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {ev.status === "pending" && (<>
                          <button onClick={() => handleApprove(ev.id)} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100 flex items-center gap-0.5"><span className="material-symbols-outlined text-sm">check</span>Approve</button>
                          <button onClick={() => handleReject(ev.id)} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100 flex items-center gap-0.5"><span className="material-symbols-outlined text-sm">close</span>Reject</button>
                        </>)}
                        <a href={`/events/${ev.slug}`} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-slate-100"><span className="material-symbols-outlined text-lg text-slate-500">visibility</span></a>
                        <button onClick={() => handleDelete(ev.id)} className="p-1.5 rounded hover:bg-red-50"><span className="material-symbols-outlined text-lg text-red-400">delete</span></button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No events found.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
