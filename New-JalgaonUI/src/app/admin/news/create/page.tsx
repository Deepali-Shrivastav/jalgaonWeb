"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface NewsCategory { id: number; name: string; }

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0900-\u097F-]+/g, "") // Support English/Devanagari characters and hyphens
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export default function AdminNewsCreatePage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const router = useRouter();
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [formData, setFormData] = useState({ title: "", slug: "", short_description: "", content: "", category: "", status: "draft", is_breaking: false, meta_title: "", meta_description: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/v1/news/categories/`);
        const data = await res.json();
        setCategories(data.results || data);
      } catch { console.error("Error fetching categories"); }
    };
    fetchCategories();
  }, []);

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
      Object.entries(formData).forEach(([key, val]) => { if (val !== null && val !== "") data.append(key, String(val)); });
      if (imageFile) data.append("featured_image", imageFile);
      const res = await fetch(`${baseUrl}/api/v1/news/admin/articles/`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: data });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || JSON.stringify(errData));
      }
      router.push("/admin/news");
    } catch (err: any) {
      let msg = err.message || "Unknown error";
      try {
        const parsed = JSON.parse(err.message);
        if (typeof parsed === "object" && parsed !== null) {
          msg = Object.entries(parsed)
            .map(([field, errors]) => {
              const fieldLabel = field.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
              const detail = Array.isArray(errors) ? errors.join(", ") : String(errors);
              return `${fieldLabel}: ${detail}`;
            })
            .join("\n");
        }
      } catch {
        // Not a JSON string
      }
      alert("Failed to save article:\n" + msg);
    }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Create New Article</h2>
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
          <small className="text-slate-400">Unique identifier for the URL (auto-generated from title, can be customized).</small>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-600 mb-1">Category</label><select name="category" value={formData.category} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"><option value="">Select Category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-600 mb-1">Status</label><select name="status" value={formData.status} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"><option value="draft">Draft</option><option value="review">Review</option><option value="published">Published</option></select></div>
        </div>
        <div><label className="block text-sm font-medium text-slate-600 mb-1">Short Description *</label><textarea name="short_description" value={formData.short_description} onChange={handleChange} required rows={2} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-medium text-slate-600 mb-1">Content *</label><textarea name="content" value={formData.content} onChange={handleChange} required rows={12} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" /><small className="text-slate-400">Separate paragraphs with a blank line.</small></div>
        <div className="grid grid-cols-2 gap-4 items-end">
          <div><label className="block text-sm font-medium text-slate-600 mb-1">Featured Image *</label><input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} accept="image/*" required className="w-full p-2 border border-slate-200 rounded-lg text-sm" /></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="is_breaking" checked={formData.is_breaking} onChange={handleChange} className="w-4 h-4" /><span className="text-sm font-medium text-slate-600">Mark as Breaking News</span></label>
        </div>
        <h3 className="text-base font-semibold mt-2">SEO Metadata</h3>
        <div><label className="block text-sm font-medium text-slate-600 mb-1">SEO Title</label><input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" placeholder="Leave empty to use article title" /></div>
        <div><label className="block text-sm font-medium text-slate-600 mb-1">SEO Description</label><textarea name="meta_description" value={formData.meta_description} onChange={handleChange} rows={2} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" placeholder="Leave empty to use short description" /></div>
        <button type="submit" disabled={saving} className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50">{saving ? "Saving..." : "Publish Article"}</button>
      </form>
    </div>
  );
}
