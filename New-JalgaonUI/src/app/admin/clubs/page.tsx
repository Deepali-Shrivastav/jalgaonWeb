"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Pagination from "@/components/Pagination";

interface Club {
  id: number;
  name: string;
  slug: string;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  category: { id: number; name: string } | null;
}

export default function AdminClubsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${baseUrl}/api/v1/clubs/admin/clubs/?search=${searchTerm}&page=${page}`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setClubs(data.results || data || []);
      if (data.count !== undefined) {
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setTotalPages(1);
      }
    } catch (e) {
      console.error("Error fetching admin clubs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchClubs();
  }, [searchTerm, statusFilter, page]);

  const handleApprove = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/clubs/admin/clubs/${id}/approve/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        fetchClubs();
      } else {
        alert("Failed to approve club.");
      }
    } catch {
      alert("Error approving club.");
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt("Enter rejection reason (optional):") || "";
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/clubs/admin/clubs/${id}/reject/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ rejection_reason: reason })
      });
      if (res.ok) {
        fetchClubs();
      } else {
        alert("Failed to reject club.");
      }
    } catch {
      alert("Error rejecting club.");
    }
  };

  const handleToggleVerified = async (id: number, currentVal: boolean) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/clubs/admin/clubs/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_verified: !currentVal })
      });
      if (res.ok) {
        fetchClubs();
      }
    } catch {
      alert("Failed to toggle verification status.");
    }
  };

  const handleToggleFeatured = async (id: number, currentVal: boolean) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/clubs/admin/clubs/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_featured: !currentVal })
      });
      if (res.ok) {
        fetchClubs();
      }
    } catch {
      alert("Failed to toggle featured status.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this club?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/clubs/admin/clubs/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchClubs();
      } else {
        alert("Failed to delete club.");
      }
    } catch {
      alert("Error deleting club.");
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedClubs = React.useMemo(() => {
    if (!sortConfig) return clubs;
    return [...clubs].sort((a: any, b: any) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (sortConfig.key === 'category') {
        aVal = a.category?.name || '';
        bVal = b.category?.name || '';
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [clubs, sortConfig]);

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "approved": return "bg-green-100 text-green-700 border border-green-200";
      case "rejected": return "bg-red-100 text-red-700 border border-red-200";
      default: return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clubs Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Moderate community, social, and sports clubs. Verify listings and manage categories.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/clubs/categories"
            className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">category</span>
            Manage Categories
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full md:max-w-[360px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Search clubs by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Table container */}
        <div className="overflow-x-auto w-full">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">Club Name <span className="material-symbols-outlined text-[16px] text-slate-400">{sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('category')}>
                    <div className="flex items-center gap-1">Category <span className="material-symbols-outlined text-[16px] text-slate-400">{sortConfig?.key === 'category' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Verification</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Featured</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedClubs.length > 0 ? (
                  sortedClubs.map(club => (
                    <tr key={club.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-800">{club.name}</td>
                      <td className="px-4 py-3.5 text-slate-600">{club.category?.name || 'General'}</td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggleVerified(club.id, club.is_verified)}
                          className={`p-1 rounded-full border transition-colors ${
                            club.is_verified
                              ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Toggle Verification"
                        >
                          <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: club.is_verified ? "'FILL' 1" : "'FILL' 0"}}>verified</span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggleFeatured(club.id, club.is_featured)}
                          className={`p-1 rounded-full border transition-colors ${
                            club.is_featured
                              ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Toggle Featured"
                        >
                          <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: club.is_featured ? "'FILL' 1" : "'FILL' 0"}}>star</span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${getStatusBadge(club.status)}`}>
                          {club.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          {club.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(club.id)}
                                className="p-1 rounded hover:bg-green-50 text-green-600"
                                title="Approve Club"
                              >
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                              </button>
                              <button
                                onClick={() => handleReject(club.id)}
                                className="p-1 rounded hover:bg-red-50 text-red-500"
                                title="Reject Club"
                              >
                                <span className="material-symbols-outlined text-[20px]">cancel</span>
                              </button>
                            </>
                          )}
                          {club.status === "approved" && club.slug && (
                            <Link
                              href={`/clubs/${club.slug}`}
                              target="_blank"
                              className="p-1 rounded hover:bg-slate-100 text-slate-600"
                              title="View Public Profile"
                            >
                              <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(club.id)}
                            className="p-1 rounded hover:bg-red-50 text-red-500"
                            title="Delete Club"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-slate-400">
                      <span className="material-symbols-outlined text-5xl mb-2 text-slate-300">groups</span>
                      <p className="font-semibold text-slate-500">No Clubs Found</p>
                      <p className="text-xs mt-1">Try resetting filters or search query.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
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
