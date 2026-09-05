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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdown(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

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
        <div>
          <h2 className="text-2xl font-extrabold text-ink-deep">My Listings</h2>
          <p className="text-xs text-secondary mt-1">Manage, edit, view, and trace analytics for your business listings.</p>
        </div>
        <Link href="/add-listing" className="bg-primary hover:bg-primary-deep text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm flex items-center gap-1">
          <span className="material-symbols-outlined text-[18px]">add_business</span> Add Listing
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
        <div className="bg-white rounded-xl border border-hairline-soft shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[360px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-secondary uppercase tracking-wider border-b border-hairline-soft">
                  <th className="p-4 pl-6">Business / Listing</th>
                  <th className="p-4">Category & City</th>
                  <th className="p-4">Reviews & Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-soft text-sm">
                {data.map((item: any, i) => {
                  const mediaUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                  const bannerImage = item.business_banner
                    ? (item.business_banner.startsWith('http') ? item.business_banner : `${mediaUrl}${item.business_banner}`)
                    : null;

                  return (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      {/* Business / Listing */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-hairline-soft flex items-center justify-center shrink-0">
                            {bannerImage ? (
                              <img src={bannerImage} alt={item.business_name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-slate-400 text-xl">storefront</span>
                            )}
                          </div>
                          <div className="max-w-[240px]">
                            <p className="font-bold text-ink-deep line-clamp-1 text-sm">{item.business_name}</p>
                            <p className="text-xs text-secondary line-clamp-1 mt-0.5">{item.business_description || 'No description provided.'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category & City */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          {item.main_category_name && (
                            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full uppercase">
                              {item.main_category_name}
                            </span>
                          )}
                          <p className="text-xs text-secondary flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
                            {item.city || 'Jalgaon'}
                          </p>
                        </div>
                      </td>

                      {/* Reviews & Rating */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5 bg-amber-50 text-amber-700 text-xs font-bold px-2 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[13px] fill-amber-700 text-amber-700">star</span>
                            {Number(item.avg_rating || 0).toFixed(1)}
                          </div>
                          <span className="text-xs text-secondary">({item.review_count || 0} reviews)</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          item.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                          item.status === 'rejected' ? 'bg-red-50 text-red-700' :
                          item.status === 'suspended' ? 'bg-slate-200 text-slate-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {item.status || 'pending'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center pr-6 relative">
                        <div className="inline-block text-left">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === item.slug ? null : item.slug);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all"
                          >
                            Actions <span className="material-symbols-outlined text-[14px]">keyboard_arrow_down</span>
                          </button>

                          {activeDropdown === item.slug && (
                            <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 text-left">
                              <Link
                                href={`/category/${item.main_category_slug || 'business'}/${item.slug}`}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <span className="material-symbols-outlined text-slate-400 text-[16px]">visibility</span> View Listing
                              </Link>
                              <Link
                                href={`/account/my-listings/${item.slug}/analytics`}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-purple-600 hover:bg-purple-50 transition-colors"
                              >
                                <span className="material-symbols-outlined text-purple-400 text-[16px]">analytics</span> Analytics
                              </Link>
                              <Link
                                href={`/add-job?listing_id=${item.id}&company_name=${encodeURIComponent(item.business_name || '')}`}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <span className="material-symbols-outlined text-blue-400 text-[16px]">work</span> List Job
                              </Link>
                              <Link
                                href={`/edit-listing/${item.slug}`}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <span className="material-symbols-outlined text-emerald-400 text-[16px]">edit</span> Edit Profile
                              </Link>
                              <div className="border-t border-slate-100 my-1"></div>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleDeleteListing(item.slug);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                              >
                                <span className="material-symbols-outlined text-red-400 text-[16px]">delete</span> Delete Listing
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
