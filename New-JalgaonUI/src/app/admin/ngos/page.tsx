"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";

interface Ngo {
  id: number;
  name: string;
  category: { name: string } | string;
  address: string;
  is_verified: boolean;
  status?: string;
}

export default function AdminNgosPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNgos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Use the standard NGO endpoint for now, can be updated to an admin-specific one if it exists
      const res = await fetch(`${baseUrl}/api/v1/ngo/?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNgos(data.results || data || []);
      if (data.count !== undefined) {
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setTotalPages(1);
      }
    } catch {
      setError("Failed to load NGOs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgos();
  }, [page]);

  const handleToggleVerify = async (id: number, currentStatus: boolean) => {
    const token = localStorage.getItem("token");
    try {
      // Endpoint to verify/unverify - assuming standard REST or a specific admin action
      // If it doesn't exist, this will just fail gracefully and alert
      await fetch(`${baseUrl}/api/v1/ngo/${id}/verify/`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ is_verified: !currentStatus })
      });
      setActionMsg(currentStatus ? "NGO verification removed." : "NGO verified.");
      fetchNgos();
      setTimeout(() => setActionMsg(""), 3000);
    } catch {
      alert("Failed to toggle verification status.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this NGO permanently?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${baseUrl}/api/v1/ngo/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNgos(ngos.filter(n => n.id !== id));
      setActionMsg("NGO deleted.");
      setTimeout(() => setActionMsg(""), 3000);
    } catch {
      alert("Failed to delete.");
    }
  };

  const getCategoryName = (category: any) => {
    if (typeof category === 'string') return category;
    if (category && category.name) return category.name;
    return 'General';
  };

  return (
    <div className="space-y-4">
      {actionMsg && <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">{actionMsg}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">NGO Management</h2>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">add</span> Add NGO
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
            </div>
          ) : error ? (
            <div className="p-4 text-red-600">{error}</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">NGO Name</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Category</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Location</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Verification</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ngos.length > 0 ? ngos.map((ngo) => (
                  <tr key={ngo.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3"><strong>{ngo.name}</strong></td>
                    <td className="px-4 py-3">{getCategoryName(ngo.category)}</td>
                    <td className="px-4 py-3">{ngo.address || "Jalgaon"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-max ${ngo.is_verified ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                        {ngo.is_verified && <span className="material-symbols-outlined text-[14px]">verified</span>}
                        {ngo.is_verified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleToggleVerify(ngo.id, ngo.is_verified)} 
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100"
                        >
                          {ngo.is_verified ? "Unverify" : "Verify"}
                        </button>
                        <button onClick={() => handleDelete(ngo.id)} className="p-1.5 rounded hover:bg-red-50">
                          <span className="material-symbols-outlined text-lg text-red-400">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No NGOs found.</td>
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
