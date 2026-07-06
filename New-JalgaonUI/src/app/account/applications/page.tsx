'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';

export default function ApplicationsPage() {
  const { isLogin } = useContext(AuthContext);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/jobs/my-applications/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch applications");
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
      fetchApplications();
    }
  }, [isLogin]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-hairline-soft">
        <h2 className="text-2xl font-extrabold text-ink-deep">My Applications</h2>
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
          <span className="material-symbols-outlined text-5xl text-secondary/50 mb-3 block">description</span>
          <p className="text-secondary font-medium mb-4">No job applications submitted yet.</p>
          <Link href="/jobs" className="bg-primary hover:bg-primary-deep text-white font-bold px-6 py-2 rounded-full transition-all text-sm">
            Explore Jobs
          </Link>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((item: any, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-hairline-soft shadow-sm hover:border-primary transition-all flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-ink-deep text-lg mb-1">Job: {item.job_title}</h4>
                <p className="text-sm text-secondary mb-2">{item.company || 'Private Employer'}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-secondary">Status:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                    item.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                    item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    item.status === 'reviewed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.status || 'pending'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-hairline-soft text-xs text-secondary">
                <span>Applied on: {new Date(item.applied_at).toLocaleDateString()}</span>
                {item.job_slug && (
                  <Link href={`/jobs/${item.job_slug}`} className="text-primary font-bold text-sm hover:underline">
                    View Position &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
