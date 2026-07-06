"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";

interface Article { id: number; title: string; slug: string; status: string; created_at: string; view_count: number; is_breaking: boolean; }

export default function AdminNewsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/news/admin/articles/?page=${page}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setArticles(data.results || data);
      if (data.count !== undefined) {
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setTotalPages(1);
      }
    } catch { setError("Failed to load articles."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchArticles(); }, [page]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this article? This cannot be undone.")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${baseUrl}/api/v1/news/admin/articles/${id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setArticles(articles.filter(a => a.id !== id));
    } catch { alert("Failed to delete article."); }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${baseUrl}/api/v1/news/admin/articles/${id}/status/`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      fetchArticles();
    } catch { alert("Failed to update status."); }
  };

  if (loading) return <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">News Articles</h2>
          <button onClick={() => router.push("/admin/news/create")} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-1"><span className="material-symbols-outlined text-sm">add</span>New Article</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left"><tr>
              <th className="px-4 py-3 font-semibold text-slate-600">Title</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Views</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {articles.length > 0 ? articles.map(article => (
                <tr key={article.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {article.is_breaking && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">BREAKING</span>}
                      <span className="font-medium">{article.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select value={article.status} onChange={(e) => handleStatusChange(article.id, e.target.value)} className={`px-2 py-1 rounded text-xs font-medium border-0 ${article.status === "published" ? "bg-green-100 text-green-700" : article.status === "draft" ? "bg-slate-100 text-slate-600" : "bg-yellow-100 text-yellow-700"}`}>
                      <option value="draft">Draft</option><option value="review">Review</option><option value="published">Published</option><option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(article.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{article.view_count || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <a href={`/news/${article.slug}`} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-slate-100"><span className="material-symbols-outlined text-lg text-slate-500">visibility</span></a>
                      <button onClick={() => router.push(`/admin/news/edit/${article.id}`)} className="p-1.5 rounded hover:bg-slate-100"><span className="material-symbols-outlined text-lg text-slate-500">edit</span></button>
                      <button onClick={() => handleDelete(article.id)} className="p-1.5 rounded hover:bg-red-50"><span className="material-symbols-outlined text-lg text-red-400">delete</span></button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No articles found. Create one!</td></tr>}
            </tbody>
          </table>
        </div>
        
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      </div>
    </div>
  );
}
