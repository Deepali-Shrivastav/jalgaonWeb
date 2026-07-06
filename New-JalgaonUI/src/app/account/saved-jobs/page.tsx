'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function SavedJobsPage() {
  const { isLogin } = useContext(AuthContext);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/jobs/saved/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch saved jobs");
      const result = await res.json();
      setData(result.results || result || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLogin) {
      fetchSavedJobs();
    }
  }, [isLogin]);

  const handleUnsave = async (slug: string) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/jobs/${slug}/save/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const responseData = await res.json();
        if (responseData.status === 'unsaved') {
          toast.success("Job removed from bookmarks.");
          setData(prev => prev.filter(item => (item.job?.slug !== slug && item.slug !== slug)));
        } else {
          toast.success("Job bookmarked.");
        }
      } else {
        toast.error("Failed to update bookmark.");
      }
    } catch (err) {
      toast.error("Error updating bookmark.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-hairline-soft">
        <h2 className="text-2xl font-extrabold text-ink-deep">Saved Jobs</h2>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-2">error</span>
          <p className="text-ink-deep font-bold">{error}</p>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-dashed border-hairline-soft flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-secondary/50 mb-3 block">bookmark</span>
          <p className="text-secondary font-medium mb-4">No saved jobs found.</p>
          <Link href="/jobs" className="bg-primary hover:bg-primary-deep text-white font-bold px-6 py-2 rounded-full transition-all text-sm">
            Explore Jobs
          </Link>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((item: any, i) => {
            const job = item.job || item;
            return (
              <div key={i} className="bg-white p-5 rounded-xl border border-hairline-soft shadow-sm hover:border-primary transition-all flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-ink-deep text-lg mb-1 line-clamp-1">{job.title}</h4>
                  <p className="text-sm text-secondary mb-2">{job.company || 'Private Business'}</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {job.job_type && (
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">
                        {job.job_type.replace('_', ' ')}
                      </span>
                    )}
                    {job.location && (
                      <span className="text-[10px] bg-secondary/10 text-secondary font-bold px-2 py-0.5 rounded-full">
                        📍 {job.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-hairline-soft">
                  <Link href={`/jobs/${job.slug}`} className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">visibility</span> View Job
                  </Link>
                  <button onClick={() => handleUnsave(job.slug)} className="text-red-500 font-bold text-sm hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">bookmark_remove</span> Unsave
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
