'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function SavedListingsPage() {
  const { isLogin } = useContext(AuthContext);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/listings/user/favorites/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch saved listings");
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
      fetchFavorites();
    }
  }, [isLogin]);

  const handleUnsave = async (shopListingId: number) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/listings/user/favorites/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shop_listing_id: shopListingId })
      });
      
      if (res.ok) {
        toast.success("Listing removed from favorites.");
        setData(prev => prev.filter(item => (item.shop_listing?.id !== shopListingId && item.id !== shopListingId)));
      } else {
        toast.error("Failed to remove listing from favorites.");
      }
    } catch (err) {
      toast.error("Error removing listing from favorites.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-hairline-soft">
        <h2 className="text-2xl font-extrabold text-ink-deep">Saved Listings</h2>
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
          <span className="material-symbols-outlined text-5xl text-secondary/50 mb-3 block">favorite</span>
          <p className="text-secondary font-medium mb-4">No saved listings found.</p>
          <Link href="/" className="bg-primary hover:bg-primary-deep text-white font-bold px-6 py-2 rounded-full transition-all text-sm">
            Explore Directory
          </Link>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((item: any, i) => {
            const shop = item.shop_listing || item;
            return (
              <div key={i} className="bg-white p-5 rounded-xl border border-hairline-soft shadow-sm hover:border-primary transition-all flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-ink-deep text-lg mb-2 line-clamp-1">{shop.business_name}</h4>
                  <p className="text-sm text-secondary mb-4 line-clamp-2">{shop.business_description}</p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-hairline-soft">
                  <Link href={`/directory/${shop.slug}`} className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">visibility</span> View
                  </Link>
                  <button onClick={() => handleUnsave(shop.id)} className="text-red-500 font-bold text-sm hover:underline flex items-center gap-1">
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
