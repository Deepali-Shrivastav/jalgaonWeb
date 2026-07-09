"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

interface Industry {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export default function AdminIndustriesPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameInput, setNameInput] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchIndustries = async () => {
    try {
      const token = localStorage.getItem("token");
      // Load all industries (public list might filter only active ones, but admin endpoint loads all)
      const res = await fetch(`${baseUrl}/api/v1/startups/admin/industries/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIndustries(data.results || data || []);
      }
    } catch {
      toast.error("Error loading industries list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustries();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/startups/admin/industries/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: nameInput })
      });

      if (res.ok) {
        toast.success("Sector created successfully!");
        setNameInput("");
        fetchIndustries();
      } else {
        toast.error("Failed to create sector.");
      }
    } catch {
      toast.error("Error creating sector.");
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/startups/admin/industries/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: editingName })
      });

      if (res.ok) {
        toast.success("Sector updated successfully!");
        setEditingId(null);
        fetchIndustries();
      } else {
        toast.error("Failed to update sector.");
      }
    } catch {
      toast.error("Error updating sector.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this sector?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/startups/admin/industries/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Sector deleted successfully!");
        fetchIndustries();
      } else {
        toast.error("Failed to delete sector.");
      }
    } catch {
      toast.error("Error deleting sector.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Toaster position="top-center" />
      
      <div className="flex items-center gap-3">
        <Link href="/admin/startups" className="text-slate-500 hover:text-slate-700">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Sectors & Industries</h1>
          <p className="text-slate-500 text-sm mt-0.5">Add, rename, or delete startup industry categorization sectors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Create form */}
        <div className="md:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">add_circle</span> Add New Sector
          </h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Sector Name *</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Agritech"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white font-semibold text-xs py-2 rounded-lg hover:bg-primary-deep transition-all"
            >
              Add Sector
            </button>
          </form>
        </div>

        {/* Right Side: List / Edit list */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-800">Registered Sectors ({industries.length})</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
              </div>
            ) : industries.length > 0 ? (
              industries.map(ind => (
                <div key={ind.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  {editingId === ind.id ? (
                    <div className="flex items-center gap-2 w-full max-w-sm">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs w-full focus:outline-none"
                      />
                      <button
                        onClick={() => handleUpdate(ind.id)}
                        className="bg-emerald-500 text-white font-semibold text-[10px] px-3 py-1.5 rounded hover:bg-emerald-600 shrink-0"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-slate-200 text-slate-700 font-semibold text-[10px] px-3 py-1.5 rounded hover:bg-slate-300 shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{ind.name}</h4>
                      <p className="text-slate-400 text-[10px]">Slug: {ind.slug}</p>
                    </div>
                  )}

                  {editingId !== ind.id && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingId(ind.id);
                          setEditingName(ind.name);
                        }}
                        className="p-1 rounded text-slate-500 hover:bg-slate-100"
                        title="Rename Sector"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(ind.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-50"
                        title="Delete Sector"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs italic">No sectors registered yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
