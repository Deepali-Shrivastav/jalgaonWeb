"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  view_count: number;
  author_name: string;
}

export default function AdminBlogPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/blog/admin/posts/?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load blog posts");
      const data = await res.json();
      setPosts(data.results || data);
      if (data.count !== undefined) {
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load blog posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this blog post? This cannot be undone.")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/blog/admin/posts/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Delete failed");
      setPosts(posts.filter(p => p.id !== id));
    } catch {
      alert("Failed to delete blog post.");
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/blog/admin/posts/${id}/status/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Status update failed");
      fetchPosts();
    } catch {
      alert("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Blog Posts</h2>
          <button
            onClick={() => router.push("/admin/blog/create")}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">add</span>New Post
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Title</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Author</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Date Created</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Views</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">{post.title}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{post.author_name}</td>
                    <td className="px-4 py-3">
                      <select
                        value={post.status}
                        onChange={(e) => handleStatusChange(post.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs font-semibold border-0 cursor-pointer ${
                          post.status === "published"
                            ? "bg-green-100 text-green-700"
                            : post.status === "draft"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        <option value="draft">Draft</option>
                        <option value="review">Review</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{post.view_count || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded hover:bg-slate-100"
                          title="View live post"
                        >
                          <span className="material-symbols-outlined text-lg text-slate-500">visibility</span>
                        </a>
                        <button
                          onClick={() => router.push(`/admin/blog/edit/${post.id}`)}
                          className="p-1.5 rounded hover:bg-slate-100"
                          title="Edit post"
                        >
                          <span className="material-symbols-outlined text-lg text-slate-500">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 rounded hover:bg-red-50"
                          title="Delete post"
                        >
                          <span className="material-symbols-outlined text-lg text-red-400">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No blog posts found. Create one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
