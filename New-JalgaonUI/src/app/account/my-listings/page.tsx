'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function MyListingsPage() {
  const { isLogin } = useContext(AuthContext);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/listings/user/my-listings/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch listings");
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
      fetchListings();
    }
  }, [isLogin]);

  const handleDeleteListing = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/listings/${slug}/delete/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success("Listing deleted successfully.");
        setData(prev => prev.filter(item => item.slug !== slug));
      } else {
        toast.error("Failed to delete listing.");
      }
    } catch (err) {
      toast.error("Error deleting listing.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-hairline-soft">
        <h2 className="text-2xl font-extrabold text-ink-deep">My Listings</h2>
        <Link href="/add-listing" className="bg-primary hover:bg-primary-deep text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm">
          Add Listing
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
          <span className="material-symbols-outlined text-5xl text-secondary/50 mb-3 block">storefront</span>
          <p className="text-secondary font-medium mb-4">No listings found.</p>
          <Link href="/add-listing" className="bg-primary hover:bg-primary-deep text-white font-bold px-6 py-2 rounded-full transition-all text-sm">
            Add Your First Listing
          </Link>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((item: any, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-hairline-soft shadow-sm hover:border-primary transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="font-bold text-ink-deep text-lg line-clamp-1">{item.business_name}</h4>
                  {item.category?.name && (
                    <span className="text-[10px] bg-secondary/10 text-secondary font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                      {item.category.name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-secondary mb-4 line-clamp-2">{item.business_description}</p>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-hairline-soft">
                <Link href={`/directory/${item.slug}`} className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">visibility</span> View
                </Link>
                <div className="flex gap-3">
                  <Link href={`/add-job?listing_id=${item.id}&company_name=${encodeURIComponent(item.business_name || '')}`} className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">work</span> List Job
                  </Link>
                  <Link href={`/edit-listing/${item.slug}`} className="text-emerald-600 font-bold text-sm hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                  </Link>
                  <button onClick={() => handleDeleteListing(item.slug)} className="text-red-500 font-bold text-sm hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
