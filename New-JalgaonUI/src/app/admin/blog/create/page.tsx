"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BlogCategory {
  id: number;
  name: string;
}

export default function AdminBlogCreatePage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const router = useRouter();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
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
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/v1/blog/categories/`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data.results || data);
      } catch {
        console.error("Error fetching blog categories");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFile && imageFile.size > 1048576) {
      alert("File too large. Please upload an image smaller than 1MB.");
      return;
    }
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

      const res = await fetch(`${baseUrl}/api/v1/blog/admin/posts/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });

      if (!res.ok) {
        let errMsg = "Save post failed";
        try {
          const errData = await res.json();
          // Extract the first error message from the object if it exists
          if (typeof errData === 'object' && errData !== null) {
            const firstKey = Object.keys(errData)[0];
            if (firstKey) {
              errMsg = `${firstKey}: ${errData[firstKey]}`;
            }
          }
        } catch {
          // If response isn't JSON, it might be an Nginx error (e.g. 413)
          if (res.status === 413) {
            errMsg = "File too large. Please upload an image smaller than 1MB.";
          } else {
            errMsg = `Server error: ${res.status} ${res.statusText}`;
          }
        }
        throw new Error(errMsg);
      }

      router.push("/admin/blog");
    } catch (err: any) {
      alert(err.message || "Failed to save blog post.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-800">Create New Blog Post</h2>
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
            placeholder="e.g. 10 Best Places to Visit in Jalgaon"
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
            placeholder="A brief summary for the cards and search engine results."
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
            placeholder="<p>Use standard HTML markup tags for paragraphs, sub-headings, lists, bold text etc.</p>"
          />
          <small className="text-slate-400 block mt-1">
            Tip: Wrap paragraphs in &lt;p&gt; tags, headings in &lt;h2&gt; / &lt;h3&gt; for the auto TOC generator.
          </small>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Featured Image *</label>
          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            accept="image/*"
            required
            className="w-full p-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:border-primary outline-none"
          />
        </div>

        <div className="border-t border-slate-100 pt-5 mt-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">SEO Metadata (Optional)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">SEO Title</label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-primary outline-none text-slate-800"
                placeholder="Leave empty to use the post title"
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
                placeholder="Leave empty to use the short description"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-primary text-white rounded-lg font-bold text-sm hover:shadow-md disabled:opacity-50 transition-all"
        >
          {saving ? "Creating post..." : "Create Post"}
        </button>
      </form>
    </div>
  );
}
