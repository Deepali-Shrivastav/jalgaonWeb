'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';

export default function DashboardClient() {
  const { user, isLogin } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLogin) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData([]);
      
      try {
        const token = localStorage.getItem('token');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        let endpoint = '';
        if (activeTab === 'listings') endpoint = '/api/v1/listings/user/my-listings/';
        else if (activeTab === 'saved-listings') endpoint = '/api/v1/listings/user/favorites/';
        else if (activeTab === 'my-jobs') endpoint = '/api/v1/jobs/my-jobs/';
        else if (activeTab === 'saved-jobs') endpoint = '/api/v1/jobs/saved/';
        else if (activeTab === 'applications') endpoint = '/api/v1/jobs/my-applications/';

        if (endpoint) {
          const res = await fetch(`${baseUrl}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error(`Failed to fetch ${activeTab}`);
          const result = await res.json();
          setData(result.results || result);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab !== 'overview') {
      fetchData();
    }
  }, [activeTab, isLogin]);

  if (!isLogin) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-hairline-soft">
        <span className="material-symbols-outlined text-6xl text-secondary mb-4 block">lock</span>
        <h2 className="text-2xl font-bold text-ink-deep mb-2">Login Required</h2>
        <p className="text-secondary mb-6">Please log in to access your dashboard.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'listings', label: 'My Listings', icon: 'storefront' },
    { id: 'saved-listings', label: 'Saved Listings', icon: 'favorite' },
    { id: 'my-jobs', label: 'My Jobs', icon: 'work' },
    { id: 'saved-jobs', label: 'Saved Jobs', icon: 'bookmark' },
    { id: 'applications', label: 'My Applications', icon: 'description' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <aside className="lg:col-span-1">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-hairline-soft sticky top-24">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-hairline-soft">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
              {user?.phone_number?.[0] || 'U'}
            </div>
            <div>
              <p className="font-bold text-ink-deep">{user?.phone_number || 'User'}</p>
              <p className="text-xs text-secondary capitalize">{user?.role || 'Member'}</p>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                  activeTab === tab.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-secondary hover:bg-surface-container-low hover:text-ink-deep'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-hairline-soft min-h-[600px]">
          <h2 className="text-2xl font-extrabold text-ink-deep mb-6 pb-4 border-b border-hairline-soft capitalize">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl text-primary mb-3">storefront</span>
                <h3 className="font-bold text-ink-deep">Manage Listings</h3>
                <p className="text-sm text-secondary mt-1">View and edit your business profiles.</p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl text-emerald-600 mb-3">work</span>
                <h3 className="font-bold text-ink-deep">Track Jobs</h3>
                <p className="text-sm text-secondary mt-1">Manage your job posts and applications.</p>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && loading && (
            <div className="flex justify-center items-center py-20">
              <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
            </div>
          )}

          {activeTab !== 'overview' && error && (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-red-500 text-5xl mb-2">error</span>
              <p className="text-ink-deep font-bold">{error}</p>
            </div>
          )}

          {activeTab !== 'overview' && !loading && !error && data.length === 0 && (
            <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-dashed border-hairline-soft flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-secondary/50 mb-3 block">search_off</span>
              <p className="text-secondary font-medium mb-4">No records found.</p>
              {activeTab === 'listings' && (
                <Link href="/add-listing" className="bg-primary hover:bg-primary-deep text-white font-bold px-6 py-2 rounded-full transition-all text-sm">
                  Add Your First Listing
                </Link>
              )}
              {(activeTab === 'saved-listings' || activeTab === 'my-jobs' || activeTab === 'saved-jobs' || activeTab === 'applications') && (
                <Link href={activeTab.includes('job') || activeTab === 'applications' ? "/jobs" : "/directory"} className="bg-primary hover:bg-primary-deep text-white font-bold px-6 py-2 rounded-full transition-all text-sm">
                  Explore {activeTab.includes('job') || activeTab === 'applications' ? "Jobs" : "Directory"}
                </Link>
              )}
            </div>
          )}

          {activeTab !== 'overview' && !loading && !error && data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.map((item: any, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-hairline-soft shadow-sm hover:border-primary transition-all">
                  {/* Generic rendering of items based on active tab */}
                  {(activeTab === 'listings' || activeTab === 'saved-listings') && (
                    <>
                      <h4 className="font-bold text-ink-deep mb-2">{item.business_name || item.shop_listing?.business_name}</h4>
                      <p className="text-sm text-secondary mb-4 line-clamp-2">{item.business_description || item.shop_listing?.business_description}</p>
                      <Link href={`/directory/${item.slug || item.shop_listing?.slug}`} className="text-primary font-bold text-sm hover:underline">
                        View Listing &rarr;
                      </Link>
                    </>
                  )}
                  {(activeTab === 'my-jobs' || activeTab === 'saved-jobs') && (
                    <>
                      <h4 className="font-bold text-ink-deep mb-2">{item.title || item.job?.title}</h4>
                      <p className="text-sm text-secondary mb-4">{item.company || item.job?.company}</p>
                      <Link href={`/jobs/${item.slug || item.job?.slug}`} className="text-primary font-bold text-sm hover:underline">
                        View Job &rarr;
                      </Link>
                    </>
                  )}
                  {activeTab === 'applications' && (
                    <>
                      <h4 className="font-bold text-ink-deep mb-2">Job: {item.job_title}</h4>
                      <p className="text-sm text-secondary mb-4">Status: <span className="font-bold uppercase text-primary">{item.status}</span></p>
                      <span className="text-xs text-secondary">Applied on: {new Date(item.applied_at).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
