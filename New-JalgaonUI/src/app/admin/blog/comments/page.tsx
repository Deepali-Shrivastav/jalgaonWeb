"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";

interface BlogComment {
  id: number;
  user_name: string;
  post_title: string;
  body: string;
  status: string;
}

export default function AdminBlogCommentsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/blog/admin/comments/?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setComments(data.results || data);
      if (data.count !== undefined) {
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setTotalPages(1);
      }
    } catch {
      console.error("Error fetching comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page]);

  const handleStatusUpdate = async (id: number, status: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/blog/admin/comments/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Status update failed");
      fetchComments();
    } catch {
      alert("Failed to update comment status.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this comment permanently?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/blog/admin/comments/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Delete failed");
      setComments(comments.filter(c => c.id !== id));
    } catch {
      console.error("Error deleting comment");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
      </div>
    );
  }

  const badgeClass = (status: string) =>
    status === "approved"
      ? "bg-green-100 text-green-700"
      : status === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-800">Blog Comment Moderation</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600">User</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Blog Post</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Comment</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comments.length > 0 ? (
              comments.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.user_name}</td>
                  <td className="px-4 py-3 text-slate-700 font-semibold">{c.post_title}</td>
                  <td className="px-4 py-3 max-w-[300px] truncate text-slate-600">{c.body}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${badgeClass(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {c.status !== "approved" && (
                        <button
                          onClick={() => handleStatusUpdate(c.id, "approved")}
                          className="p-1.5 rounded hover:bg-green-50 text-green-600"
                          title="Approve Comment"
                        >
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                        </button>
                      )}
                      {c.status !== "rejected" && (
                        <button
                          onClick={() => handleStatusUpdate(c.id, "rejected")}
                          className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"
                          title="Reject Comment"
                        >
                          <span className="material-symbols-outlined text-lg">cancel</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500"
                        title="Delete Comment Permanently"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No comments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200">
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        </div>
      )}
    </div>
  );
}
