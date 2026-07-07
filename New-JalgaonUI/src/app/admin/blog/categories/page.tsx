"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
}

export default function AdminBlogCategoriesPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState<{
    id: number | null;
    name: string;
    slug: string;
    description: string;
    sort_order: number;
  }>({
    id: null,
    name: "",
    slug: "",
    description: "",
    sort_order: 0
  });

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/blog/admin/categories/?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data.results || data);
      if (data.count !== undefined) {
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setTotalPages(1);
      }
    } catch {
      console.error("Error fetching blog categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "name" && !prev.id
        ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") }
        : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      let res;
      if (formData.id) {
        res = await fetch(`${baseUrl}/api/v1/blog/admin/categories/${formData.id}/`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });
      } else {
        const { id, ...postData } = formData;
        res = await fetch(`${baseUrl}/api/v1/blog/admin/categories/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(postData)
        });
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert("Failed to save category: " + (errorData.detail || JSON.stringify(errorData)));
        return;
      }
      
      fetchCategories();
      setIsFormOpen(false);
      setFormData({ id: null, name: "", slug: "", description: "", sort_order: 0 });
    } catch {
      alert("Failed to save category.");
    }
  };

  const handleEdit = (cat: BlogCategory) => {
    setFormData({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      sort_order: cat.sort_order
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this category? Posts in this category will set category to null.")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/blog/admin/categories/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchCategories();
    } catch {
      alert("Failed to delete category.");
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
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Blog Categories</h2>
          <button
            onClick={() => {
              setFormData({ id: null, name: "", slug: "", description: "", sort_order: 0 });
              setIsFormOpen(!isFormOpen);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90"
          >
            {isFormOpen ? "Cancel" : "New Category"}
          </button>
        </div>
        {isFormOpen && (
          <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-primary outline-none text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-primary outline-none text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sort Order</label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-primary outline-none text-slate-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-primary outline-none text-slate-800"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
            >
              {formData.id ? "Update" : "Create"} Category
            </button>
          </form>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Slug</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Sort Order</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.length > 0 ? (
                categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800 capitalize">{cat.name}</td>
                    <td className="px-4 py-3 text-slate-500">{cat.slug}</td>
                    <td className="px-4 py-3 text-slate-600">{cat.sort_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-1.5 rounded hover:bg-slate-100"
                          title="Edit category"
                        >
                          <span className="material-symbols-outlined text-lg text-slate-500">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 rounded hover:bg-red-50"
                          title="Delete category"
                        >
                          <span className="material-symbols-outlined text-lg text-red-400">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No categories found.
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
    </div>
  );
}
