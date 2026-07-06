"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";

interface Job { id: number; title: string; company: string; status: string; created_at: string; }

export default function AdminJobsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/jobs/admin/jobs/?search=${searchTerm}&page=${page}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setJobs(data.results || data);
      if (data.count !== undefined) {
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setTotalPages(1);
      }
    } catch { console.error("Error fetching admin jobs"); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [searchTerm]);
  useEffect(() => { fetchJobs(); }, [searchTerm, page]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${baseUrl}/api/v1/jobs/admin/jobs/${id}/status/`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      fetchJobs();
    } catch { alert("Failed to update status."); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this job?")) return;
    const token = localStorage.getItem("token");
    try { await fetch(`${baseUrl}/api/v1/jobs/admin/jobs/${id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); fetchJobs(); } catch { alert("Failed to delete."); }
  };

  const filteredJobs = jobs.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.company.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedJobs = React.useMemo(() => {
    if (!sortConfig) return filteredJobs;
    return [...filteredJobs].sort((a: any, b: any) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredJobs, sortConfig]);
  
  const badgeClass = (s: string) => s === "active" ? "bg-green-100 text-green-700" : s === "rejected" || s === "closed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Manage Job Listings</h2>
          <div className="relative max-w-[400px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input type="text" placeholder="Search jobs or companies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          {loading ? <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left"><tr>
                <th className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">Title <span className="material-symbols-outlined text-[16px] text-slate-400">{sortConfig?.key === 'title' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('company')}>
                  <div className="flex items-center gap-1">Company <span className="material-symbols-outlined text-[16px] text-slate-400">{sortConfig?.key === 'company' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status <span className="material-symbols-outlined text-[16px] text-slate-400">{sortConfig?.key === 'status' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center gap-1">Posted Date <span className="material-symbols-outlined text-[16px] text-slate-400">{sortConfig?.key === 'created_at' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {sortedJobs.length > 0 ? sortedJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{job.title}</td>
                    <td className="px-4 py-3">{job.company}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${badgeClass(job.status)}`}>{job.status}</span></td>
                    <td className="px-4 py-3 text-slate-500">{new Date(job.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {job.status === "pending" && (<>
                          <button onClick={() => handleStatusChange(job.id, "active")} className="p-1.5 rounded hover:bg-green-50" title="Approve"><span className="material-symbols-outlined text-lg text-green-600">check_circle</span></button>
                          <button onClick={() => handleStatusChange(job.id, "rejected")} className="p-1.5 rounded hover:bg-red-50" title="Reject"><span className="material-symbols-outlined text-lg text-red-500">cancel</span></button>
                        </>)}
                        {job.status === "active" && <button onClick={() => handleStatusChange(job.id, "closed")} className="p-1.5 rounded hover:bg-yellow-50" title="Close"><span className="material-symbols-outlined text-lg text-yellow-600">cancel</span></button>}
                        <button onClick={() => handleDelete(job.id)} className="p-1.5 rounded hover:bg-red-50" title="Delete"><span className="material-symbols-outlined text-lg text-red-400">delete</span></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-5xl mb-2 text-slate-300">work_off</span>
                        <p className="font-medium text-slate-500 text-base">No jobs found</p>
                        <p className="text-sm mt-1">Try adjusting your filters or search query</p>
                      </div>
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
