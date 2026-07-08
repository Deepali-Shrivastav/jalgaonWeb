"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface NewsCategory { id: number; name: string; }

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0900-\u097F-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export default function AdminNewsEditPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSlugManual, setIsSlugManual] = useState(true); // Default to manual for existing articles to prevent accidental URL changes
  const [formData, setFormData] = useState({ title: "", slug: "", short_description: "", content: "", category: "", status: "draft", is_breaking: false, meta_title: "", meta_description: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [catRes, artRes] = await Promise.all([
          fetch(`${baseUrl}/api/v1/news/categories/`),
          fetch(`${baseUrl}/api/v1/news/admin/articles/${id}/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const catData = await catRes.json();
        setCategories(catData.results || catData);
        const data = await artRes.json();
        setFormData({ title: data.title || "", slug: data.slug || "", short_description: data.short_description || "", content: data.content || "", category: data.category?.id || data.category || "", status: data.status || "draft", is_breaking: data.is_breaking || false, meta_title: data.meta_title || "", meta_description: data.meta_description || "" });
      } catch { alert("Failed to load article."); router.push("/admin/news"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const isCheckbox = type === "checkbox";
    const val = isCheckbox ? target.checked : value;

    setFormData(prev => {
      const nextData = { ...prev, [name]: val };
      if (name === "title" && !isSlugManual) {
        nextData.slug = slugify(String(val));
      }
      return nextData;
    });

    if (name === "slug") {
      setIsSlugManual(true);
      if (!val) {
        setIsSlugManual(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => { if (val !== null && val !== "") data.append(key, String(typeof val === "object" ? (val as any).id : val)); });
      if (imageFile) data.append("featured_image", imageFile);
      const res = await fetch(`${baseUrl}/api/v1/news/admin/articles/${id}/`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: data });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || JSON.stringify(errData));
      }
      router.push("/admin/news");
    } catch (err: any) { alert("Failed to save article: " + (err.message || "Unknown error")); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Edit Article</h2>
        <button onClick={() => router.push("/admin/news")} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">Back to List</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div><label className="block text-sm font-medium text-slate-600 mb-1">Title *</label><input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" /></div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Slug *</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono"
            placeholder="e.g. local-news-article-slug"
          />
          <small className="text-slate-400">Unique identifier for the URL (changing this will change the article's link).</small>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-600 mb-1">Category</label><select name="category" value={formData.category} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"><option value="">Select Category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-600 mb-1">Status</label><select name="status" value={formData.status} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"><option value="draft">Draft</option><option value="review">Review</option><option value="published">Published</option></select></div>
        </div>
        <div><label className="block text-sm font-medium text-slate-600 mb-1">Short Description *</label><textarea name="short_description" value={formData.short_description} onChange={handleChange} required rows={2} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-medium text-slate-600 mb-1">Content *</label><textarea name="content" value={formData.content} onChange={handleChange} required rows={12} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" /></div>
        <div className="grid grid-cols-2 gap-4 items-end">
          <div><label className="block text-sm font-medium text-slate-600 mb-1">Featured Image (leave empty to keep existing)</label><input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} accept="image/*" className="w-full p-2 border border-slate-200 rounded-lg text-sm" /></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="is_breaking" checked={formData.is_breaking} onChange={handleChange} className="w-4 h-4" /><span className="text-sm font-medium text-slate-600">Breaking News</span></label>
        </div>
        <h3 className="text-base font-semibold mt-2">SEO Metadata</h3>
        <div><label className="block text-sm font-medium text-slate-600 mb-1">SEO Title</label><input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-medium text-slate-600 mb-1">SEO Description</label><textarea name="meta_description" value={formData.meta_description} onChange={handleChange} rows={2} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" /></div>
        <button type="submit" disabled={saving} className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50">{saving ? "Saving..." : "Update Article"}</button>
      </form>
    </div>
  );
}
