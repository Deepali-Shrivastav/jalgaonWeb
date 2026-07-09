'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';

interface AdAnalytics {
  total_ads: number;
  active_ads: number;
  pending_ads: number;
  rejected_ads: number;
  total_impressions: number;
  total_clicks: number;
  overall_ctr: number;
  ads: any[];
}

export default function AdsPage() {
  const { isLogin } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState<AdAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdsAndAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/ads/my-analytics/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch advertisements and analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLogin) {
      fetchAdsAndAnalytics();
    }
  }, [isLogin]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-hairline-soft">
        <h2 className="text-2xl font-extrabold text-ink-deep">Ad Campaigns & Analytics</h2>
        <Link href="/advertise" className="bg-primary hover:bg-primary-deep text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm">
          Advertise with Us
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

      {!loading && !error && analytics && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl border border-hairline-soft shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">Total Ads</span>
              <span className="text-3xl font-extrabold text-ink-deep mt-2">{analytics.total_ads}</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-hairline-soft shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">Active</span>
              <span className="text-3xl font-extrabold text-emerald-600 mt-2">{analytics.active_ads}</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-hairline-soft shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">Impressions</span>
              <span className="text-3xl font-extrabold text-primary mt-2">
                {analytics.total_impressions.toLocaleString()}
              </span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-hairline-soft shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">Clicks</span>
              <span className="text-3xl font-extrabold text-amber-600 mt-2">
                {analytics.total_clicks.toLocaleString()}
              </span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-hairline-soft shadow-sm col-span-2 lg:col-span-1 flex flex-col justify-between">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">Overall CTR</span>
              <span className="text-3xl font-extrabold text-blue-600 mt-2">{analytics.overall_ctr}%</span>
            </div>
          </div>

          {/* Ads List Table */}
          <div className="bg-white rounded-xl border border-hairline-soft shadow-sm overflow-hidden">
            <div className="p-5 border-b border-hairline-soft">
              <h3 className="font-extrabold text-ink-deep text-lg">My Ads</h3>
            </div>
            
            {analytics.ads.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-secondary/50 mb-3 block">campaign</span>
                <p className="text-secondary font-medium mb-4">No advertisement campaigns found.</p>
                <Link href="/advertise" className="bg-primary hover:bg-primary-deep text-white font-bold px-6 py-2 rounded-full transition-all text-sm">
                  Create First Ad Campaign
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-lowest text-xs font-bold text-secondary uppercase tracking-wider border-b border-hairline-soft">
                      <th className="p-4 pl-6">Ad / Campaign</th>
                      <th className="p-4">Placement / Package</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Impressions</th>
                      <th className="p-4 text-right">Clicks</th>
                      <th className="p-4 text-right">CTR</th>
                      <th className="p-4 text-center pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline-soft text-sm">
                    {analytics.ads.map((ad: any) => (
                      <tr key={ad.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-10 bg-surface-container-low rounded overflow-hidden border border-hairline-soft flex items-center justify-center shrink-0">
                              {ad.banner_image ? (
                                <img src={ad.banner_image} alt={ad.title} className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-secondary/40 text-lg">image</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-ink-deep line-clamp-1">{ad.title}</p>
                              {ad.target_url && (
                                <a href={ad.target_url} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline line-clamp-1">
                                  {ad.target_url}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-ink-deep">{ad.target_page_display || 'General'}</p>
                          <p className="text-xs text-secondary">{ad.package_display || 'Standard'}</p>
                        </td>
                        <td className="p-4">
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              ad.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                              ad.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {ad.status}
                            </span>
                            {ad.status === 'rejected' && ad.rejection_reason && (
                              <p className="text-[10px] text-red-500 mt-1 max-w-[200px] line-clamp-2">
                                Reason: {ad.rejection_reason}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right font-semibold text-ink-deep">
                          {ad.impressions.toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-semibold text-ink-deep">
                          {ad.clicks.toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-semibold text-primary">
                          {ad.ctr}%
                        </td>
                        <td className="p-4 text-center pr-6">
                          <Link href={`/account/ads/${ad.id}/analytics`} className="text-purple-600 font-bold text-xs hover:underline flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">analytics</span> Trends
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
