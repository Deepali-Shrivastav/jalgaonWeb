"use client";

import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

interface EventCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
}

export default function AdminEventCategoriesPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      let res = await fetch(`${baseUrl}/api/v1/events/admin/categories/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        const refreshRes = await fetch(`${baseUrl}/api/v1/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: localStorage.getItem('refresh_token') })
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          localStorage.setItem('token', refreshData.access);
          res = await fetch(`${baseUrl}/api/v1/events/admin/categories/`, {
            headers: { Authorization: `Bearer ${refreshData.access}` }
          });
        }
      }

      if (res.ok) {
        const data = await res.json();
        setCategories(data.results || data);
      } else {
        const errorText = await res.text();
        console.error("Failed to fetch event categories. Status:", res.status, "Response:", errorText);
        toast.error(`Failed to load categories (Status: ${res.status})`);
      }
    } catch (error) {
      console.error("Failed to fetch event categories", error);
      toast.error("Network error while loading categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) {
      toast.error("Category name is required");
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`${baseUrl}/api/v1/events/admin/categories/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newCategoryName })
      });
      
      if (res.ok) {
        toast.success("Event Category added successfully!");
        setIsAddModalOpen(false);
        setNewCategoryName("");
        fetchCategories();
      } else {
        const errorData = await res.json().catch(() => null);
        console.error("Add error:", errorData);
        toast.error("Failed to create category");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/events/admin/categories/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success("Category deleted");
        setCategories(categories.filter(c => c.id !== id));
      } else {
        toast.error("Failed to delete category");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Event Categories</h1>
          <p className="text-slate-500 text-sm mt-1">Manage categories for the Events Module</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No event categories found.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Category Name</th>
                  <th className="px-6 py-4 font-semibold">Slug</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{cat.name}</td>
                    <td className="px-6 py-4 text-slate-500">{cat.slug}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[95%] md:w-[450px] overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Add New Category</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddCategory} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Workshops"
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary-deep transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
