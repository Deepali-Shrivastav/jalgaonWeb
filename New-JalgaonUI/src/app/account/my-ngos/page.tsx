'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';

export default function MyNgosPage() {
  const { isLogin } = useContext(AuthContext);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNgos = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/ngo/my-ngos/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch NGOs");
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
      fetchNgos();
    }
  }, [isLogin]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-hairline-soft">
        <h2 className="text-2xl font-extrabold text-ink-deep">My NGOs</h2>
        <Link href="/add-ngo" className="bg-primary hover:bg-primary-deep text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm">
          Register NGO
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
          <span className="material-symbols-outlined text-5xl text-secondary/50 mb-3 block">volunteer_activism</span>
          <p className="text-secondary font-medium mb-4">No NGOs registered yet.</p>
          <Link href="/add-ngo" className="bg-primary hover:bg-primary-deep text-white font-bold px-6 py-2 rounded-full transition-all text-sm">
            Register Your NGO
          </Link>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((item: any, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-hairline-soft shadow-sm hover:border-primary transition-all flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-ink-deep text-lg mb-2 line-clamp-1">{item.name}</h4>
                <p className="text-sm text-secondary mb-4 line-clamp-2">{item.description}</p>
                <div className="flex flex-wrap gap-2 items-center mb-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    item.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    Verified: {item.is_verified ? 'Yes' : 'Pending'}
                  </span>
                </div>
              </div>
              {item.slug && (
                <div className="flex justify-end mt-4 pt-4 border-t border-hairline-soft">
                  <Link href={`/ngos/${item.slug}`} className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">visibility</span> View NGO
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
