'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';

export default function MyClubsPage() {
  const { isLogin } = useContext(AuthContext);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClubs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/clubs/my-clubs/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch clubs");
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
      fetchClubs();
    }
  }, [isLogin]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-hairline-soft">
        <h2 className="text-2xl font-extrabold text-ink-deep">My Clubs</h2>
        <Link href="/add-club" className="bg-primary hover:bg-primary-deep text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm">
          Register Club
        </Link>
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
          <span className="material-symbols-outlined text-5xl text-secondary/50 mb-3 block">groups</span>
          <p className="text-secondary font-medium mb-4">No clubs registered yet.</p>
          <Link href="/add-club" className="bg-primary hover:bg-primary-deep text-white font-bold px-6 py-2 rounded-full transition-all text-sm">
            Register Your Club
          </Link>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((item: any, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-hairline-soft shadow-sm hover:border-primary transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h4 className="font-bold text-ink-deep text-lg line-clamp-1">{item.name}</h4>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase whitespace-nowrap ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-secondary mb-4 line-clamp-2">{item.short_description}</p>
                <div className="flex flex-wrap gap-2 items-center mb-4 text-xs font-semibold text-secondary">
                  {item.category && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                      {item.category.name}
                    </span>
                  )}
                  {item.is_verified && (
                    <span className="text-blue-600 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span> Verified
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-hairline-soft">
                <span className="text-xs text-secondary font-medium">
                  {item.member_count || 0} contacts &middot; {item.activity_count || 0} activities
                </span>
                {item.status === 'approved' && item.slug ? (
                  <Link href={`/clubs/${item.slug}`} className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">visibility</span> View Profile
                  </Link>
                ) : (
                  <span className="text-secondary text-xs italic">Awaiting approval</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
