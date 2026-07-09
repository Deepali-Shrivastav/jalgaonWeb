"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

interface Category {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
}

export default function AdminClubCategoriesPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameInput, setNameInput] = useState("");
  const [sortOrderInput, setSortOrderInput] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingSortOrder, setEditingSortOrder] = useState(0);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/clubs/admin/categories/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.results || data || []);
      }
    } catch {
      toast.error("Error loading club categories list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/clubs/admin/categories/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: nameInput, sort_order: sortOrderInput, is_active: true })
      });

      if (res.ok) {
        toast.success("Category created successfully!");
        setNameInput("");
        setSortOrderInput(0);
        fetchCategories();
      } else {
        toast.error("Failed to create category.");
      }
    } catch {
      toast.error("Error creating category.");
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/clubs/admin/categories/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: editingName, sort_order: editingSortOrder })
      });

      if (res.ok) {
        toast.success("Category updated successfully!");
        setEditingId(null);
        fetchCategories();
      } else {
        toast.error("Failed to update category.");
      }
    } catch {
      toast.error("Error updating category.");
    }
  };

  const handleToggleActive = async (id: number, currentVal: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/clubs/admin/categories/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_active: !currentVal })
      });

      if (res.ok) {
        toast.success("Status updated!");
        fetchCategories();
      }
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/clubs/admin/categories/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Category deleted successfully!");
        fetchCategories();
      } else {
        toast.error("Failed to delete category.");
      }
    } catch {
      toast.error("Error deleting category.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Toaster position="top-center" />
      
      <div className="flex items-center gap-3">
        <Link href="/admin/clubs" className="text-slate-500 hover:text-slate-700">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Club Categories</h1>
          <p className="text-slate-500 text-sm mt-0.5">Add, rename, or prioritize club types like Sports, Cultural, Social, Volunteer, etc.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Create form */}
        <div className="md:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Category
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Category Name *</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Sports & Fitness"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Sort Order</label>
              <input
                type="number"
                value={sortOrderInput}
                onChange={(e) => setSortOrderInput(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white font-semibold text-xs py-2 rounded-lg hover:bg-primary-deep transition-all"
            >
              Create Category
            </button>
          </form>
        </div>

        {/* Right Side: List / Edit list */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-800">Registered Categories ({categories.length})</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
              </div>
            ) : categories.length > 0 ? (
              categories.map(cat => (
                <div key={cat.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2 w-full max-w-md">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs w-full focus:outline-none"
                      />
                      <input
                        type="number"
                        value={editingSortOrder}
                        onChange={(e) => setEditingSortOrder(parseInt(e.target.value) || 0)}
                        className="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs w-16 focus:outline-none"
                        title="Sort Order"
                      />
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        className="bg-emerald-500 text-white font-semibold text-[10px] px-3 py-2 rounded hover:bg-emerald-600 shrink-0"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-slate-200 text-slate-700 font-semibold text-[10px] px-3 py-2 rounded hover:bg-slate-300 shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm">{cat.name}</h4>
                        <span className="bg-slate-100 text-slate-600 text-[9px] px-1 rounded">Order: {cat.sort_order}</span>
                      </div>
                      <p className="text-slate-400 text-[10px]">Slug: {cat.slug}</p>
                    </div>
                  )}

                  {editingId !== cat.id && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleActive(cat.id, cat.is_active)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          cat.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditingName(cat.name);
                          setEditingSortOrder(cat.sort_order);
                        }}
                        className="p-1 rounded text-slate-500 hover:bg-slate-100"
                        title="Rename Category"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-50"
                        title="Delete Category"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs italic">No categories registered yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
