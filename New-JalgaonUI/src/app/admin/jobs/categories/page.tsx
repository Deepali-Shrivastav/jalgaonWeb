"use client";

import React, { useState, useEffect } from "react";

interface JobCategory { id: number; name: string; slug: string; is_active: boolean; sort_order: number; }

export default function AdminJobCategoriesPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{ id: number | null; name: string; is_active: boolean; sort_order: number }>({ id: null, name: "", is_active: true, sort_order: 0 });

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/jobs/admin/categories/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCategories(data.results || data);
    } catch { console.error("Error fetching job categories"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const payload = { ...formData };
      if (payload.id) {
        await fetch(`${baseUrl}/api/v1/jobs/admin/categories/${payload.id}/`, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        const { id, ...rest } = payload;
        await fetch(`${baseUrl}/api/v1/jobs/admin/categories/`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(rest) });
      }
      setFormData({ id: null, name: "", is_active: true, sort_order: 0 }); setIsEditing(false); fetchCategories();
    } catch { alert("Failed to save category."); }
  };

  const handleEdit = (cat: JobCategory) => { setFormData({ id: cat.id, name: cat.name, is_active: cat.is_active, sort_order: cat.sort_order }); setIsEditing(true); };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this category?")) return;
    const token = localStorage.getItem("token");
    try { await fetch(`${baseUrl}/api/v1/jobs/admin/categories/${id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); fetchCategories(); } catch { alert("Failed to delete."); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Manage Job Categories</h2>
          {!isEditing && <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-1"><span className="material-symbols-outlined text-sm">add</span>Add Category</button>}
        </div>

        {isEditing && (
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-base font-semibold mb-3">{formData.id ? "Edit Category" : "New Category"}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Category Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Graphic Design" className="w-full p-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div className="flex gap-4 items-end">
                <div className="flex-1"><label className="block text-sm font-medium text-slate-600 mb-1">Sort Order</label><input type="number" name="sort_order" value={formData.sort_order} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" /></div>
                <label className="flex items-center gap-2 cursor-pointer pb-2"><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4" /><span className="text-sm font-medium text-slate-600">Active</span></label>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90">Save Category</button>
                <button type="button" onClick={() => { setFormData({ id: null, name: "", is_active: true, sort_order: 0 }); setIsEditing(false); }} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left"><tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Slug</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Order</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {categories.length > 0 ? categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                    <td className="px-4 py-3 text-slate-500">{cat.slug}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{cat.is_active ? "Active" : "Inactive"}</span></td>
                    <td className="px-4 py-3">{cat.sort_order}</td>
                    <td className="px-4 py-3 flex gap-1">
                      <button onClick={() => handleEdit(cat)} className="p-1.5 rounded hover:bg-slate-100"><span className="material-symbols-outlined text-lg text-slate-500">edit</span></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded hover:bg-red-50"><span className="material-symbols-outlined text-lg text-red-400">delete</span></button>
                    </td>
                  </tr>
                )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No categories found.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
