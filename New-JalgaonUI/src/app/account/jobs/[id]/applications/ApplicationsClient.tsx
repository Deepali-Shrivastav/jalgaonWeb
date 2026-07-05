'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthContext } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function ApplicationsClient({ jobId }: { jobId: string }) {
  const { isLogin } = useContext(AuthContext);
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (!isLogin) return;

    const fetchApplications = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const token = localStorage.getItem('token');
        
        const res = await fetch(`${baseUrl}/api/v1/jobs/my-jobs/${jobId}/applications/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setApplications(data.results || data);
        } else {
          setError("Failed to load applications.");
        }
      } catch (err) {
        setError("An error occurred while fetching applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [isLogin, jobId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLogin && !loading) {
        router.push(`/login?redirect=/account/jobs/${jobId}/applications`);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLogin, loading, router, jobId]);

  const handleStatusChange = async (appId: number, newStatus: string) => {
    setUpdating(appId);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${baseUrl}/api/v1/jobs/my-jobs/${jobId}/applications/${appId}/status/`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        toast.success("Application status updated.");
        setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      } else {
        toast.error("Failed to update status.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setUpdating(null);
    }
  };

  if (!isLogin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary mb-4">progress_activity</span>
        <h2 className="text-xl font-bold text-ink-deep">Checking Authorization...</h2>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Toaster position="top-center" />
      <main className="py-xxxl mb-12 px-base md:px-xxl max-w-container-max mx-auto bg-surface min-h-[70vh]">
        
        <div className="flex items-center gap-4 mb-xl">
          <button onClick={() => router.push('/account')} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-primary hover:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-ink-deep">Manage Applications</h1>
            <p className="text-secondary text-sm">Review candidates and update their application status.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-xl border border-red-200">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
            <h3 className="text-xl font-bold text-ink-deep">{error}</h3>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-dashed border-hairline-soft flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-secondary/50 mb-3 block">group_off</span>
            <h3 className="text-xl font-bold text-ink-deep mb-2">No Applications Yet</h3>
            <p className="text-secondary font-medium">Wait for candidates to discover and apply to your job.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-hairline-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-hairline-soft">
                    <th className="p-4 font-bold text-ink-deep">Candidate Name</th>
                    <th className="p-4 font-bold text-ink-deep">Email / Contact</th>
                    <th className="p-4 font-bold text-ink-deep">Applied On</th>
                    <th className="p-4 font-bold text-ink-deep">Status</th>
                    <th className="p-4 font-bold text-ink-deep">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id} className="border-b border-hairline-soft hover:bg-surface-container-lowest transition-colors">
                      <td className="p-4 font-medium text-ink-deep">
                        {app.applicant_name}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-ink-deep font-medium">{app.applicant_email}</div>
                        {app.applicant_phone && <div className="text-xs text-secondary">{app.applicant_phone}</div>}
                      </td>
                      <td className="p-4 text-sm text-secondary">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          app.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                          app.status === 'shortlisted' ? 'bg-emerald-100 text-emerald-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          disabled={updating === app.id}
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="bg-surface-container-low border border-outline-variant rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        {updating === app.id && <span className="ml-2 text-xs text-primary animate-pulse">Saving...</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
