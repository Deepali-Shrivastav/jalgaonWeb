"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface BlogCategory {
  id: number;
  name: string;
}

export default function AdminBlogEditPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    content: "",
    category: "",
    status: "draft",
    meta_title: "",
    meta_description: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [catRes, postRes] = await Promise.all([
          fetch(`${baseUrl}/api/v1/blog/categories/`),
          fetch(`${baseUrl}/api/v1/blog/admin/posts/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        if (!catRes.ok || !postRes.ok) {
          throw new Error("Failed to load data");
        }
        
        const catData = await catRes.json();
        setCategories(catData.results || catData);
        
        const data = await postRes.json();
        setFormData({
          title: data.title || "",
          short_description: data.short_description || "",
          content: data.content || "",
          category: data.category?.id || data.category || "",
          status: data.status || "draft",
          meta_title: data.meta_title || "",
          meta_description: data.meta_description || ""
        });
      } catch {
        alert("Failed to load blog post.");
        router.push("/admin/blog");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== null && val !== "") {
          data.append(key, String(val));
        }
      });
      if (imageFile) {
        data.append("featured_image", imageFile);
      }

      const res = await fetch(`${baseUrl}/api/v1/blog/admin/posts/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });

      if (!res.ok) throw new Error("Save post failed");
      router.push("/admin/blog");
    } catch {
      alert("Failed to update blog post.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-800">Edit Blog Post</h2>
        <button
          onClick={() => router.push("/admin/blog")}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-primary outline-none text-slate-800"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-primary outline-none text-slate-800 capitalize"
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-primary outline-none text-slate-800"
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Short Description *</label>
          <textarea
            name="short_description"
            value={formData.short_description}
            onChange={handleChange}
            required
            rows={2}
            className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-primary outline-none text-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Content (HTML or plain text) *</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={12}
            className="w-full p-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:border-primary outline-none text-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Featured Image (leave empty to keep current)</label>
          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            accept="image/*"
            className="w-full p-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:border-primary outline-none"
          />
        </div>

        <div className="border-t border-slate-100 pt-5 mt-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">SEO Metadata</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">SEO Title</label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-primary outline-none text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">SEO Description</label>
              <textarea
                name="meta_description"
                value={formData.meta_description}
                onChange={handleChange}
                rows={2}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-primary outline-none text-slate-800"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-primary text-white rounded-lg font-bold text-sm hover:shadow-md disabled:opacity-50 transition-all"
        >
          {saving ? "Saving changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
