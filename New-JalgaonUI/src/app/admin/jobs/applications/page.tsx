"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";

interface JobApplication { id: number; applicant_name: string; applicant_email: string; job_title: string; status: string; applied_at: string; resume: string | null; }

export default function AdminJobApplicationsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/jobs/admin/applications/?search=${searchTerm}&page=${page}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setApplications(data.results || data);
      if (data.count !== undefined) {
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setTotalPages(1);
      }
    } catch { console.error("Error fetching job applications"); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [searchTerm]);
  useEffect(() => { fetchApplications(); }, [searchTerm, page]);

  const filtered = applications.filter(a => a.job_title.toLowerCase().includes(searchTerm.toLowerCase()) || a.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()));
  const badgeClass = (s: string) => { const sl = s.toLowerCase(); return sl === "accepted" || sl === "hired" ? "bg-green-100 text-green-700" : sl === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"; };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Job Applications</h2>
          <div className="relative max-w-[400px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input type="text" placeholder="Search by job or applicant..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left"><tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Applicant</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Job Title</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Applied Date</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Resume</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length > 0 ? filtered.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3"><strong>{app.applicant_name}</strong><br /><span className="text-xs text-slate-400">{app.applicant_email}</span></td>
                    <td className="px-4 py-3">{app.job_title}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${badgeClass(app.status)}`}>{app.status}</span></td>
                    <td className="px-4 py-3 text-slate-500">{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{app.resume ? <a href={`${baseUrl}${app.resume}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1"><span className="material-symbols-outlined text-lg">download</span></a> : <span className="text-slate-300">No Resume</span>}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No applications found.</td></tr>}
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
