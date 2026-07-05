"use client";

import React, { useState, useEffect } from "react";

interface Comment { id: number; user_name: string; article_title: string; body: string; status: string; }

export default function AdminNewsCommentsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/news/admin/comments/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setComments(data.results || data);
    } catch { console.error("Error fetching comments"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchComments(); }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${baseUrl}/api/v1/news/admin/comments/${id}/`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      fetchComments();
    } catch { alert("Failed to update comment status."); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this comment permanently?")) return;
    const token = localStorage.getItem("token");
    try { await fetch(`${baseUrl}/api/v1/news/admin/comments/${id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); setComments(comments.filter(c => c.id !== id)); } catch { console.error("Error deleting comment"); }
  };

  if (loading) return <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div>;

  const badgeClass = (status: string) => status === "approved" ? "bg-green-100 text-green-700" : status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-4 border-b border-slate-200"><h2 className="text-lg font-semibold">Comment Moderation</h2></div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left"><tr>
            <th className="px-4 py-3 font-semibold text-slate-600">User</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Article</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Comment</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {comments.length > 0 ? comments.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{c.user_name}</td>
                <td className="px-4 py-3">{c.article_title}</td>
                <td className="px-4 py-3 max-w-[300px] truncate">{c.body}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass(c.status)}`}>{c.status}</span></td>
                <td className="px-4 py-3 flex gap-1">
                  {c.status !== "approved" && <button onClick={() => handleStatusUpdate(c.id, "approved")} className="p-1.5 rounded hover:bg-green-50"><span className="material-symbols-outlined text-lg text-green-600">check_circle</span></button>}
                  {c.status !== "rejected" && <button onClick={() => handleStatusUpdate(c.id, "rejected")} className="p-1.5 rounded hover:bg-yellow-50"><span className="material-symbols-outlined text-lg text-yellow-600">cancel</span></button>}
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-red-50"><span className="material-symbols-outlined text-lg text-red-400">delete</span></button>
                </td>
              </tr>
            )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No comments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
