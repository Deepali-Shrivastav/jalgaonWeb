'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';

export default function DashboardClient() {
  const { user, isLogin, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteMsg, setDeleteMsg] = useState("");
  const [profileData, setProfileData] = useState({ first_name: '', last_name: '', phone_number: '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

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
        setDeleteMsg("Listing deleted successfully.");
        setData(prev => prev.filter(item => item.slug !== slug));
      } else {
        setDeleteMsg("Failed to delete listing.");
      }
    } catch (err) {
      setDeleteMsg("Error deleting listing.");
    } finally {
      setTimeout(() => setDeleteMsg(""), 4000);
    }
  };

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
        else if (activeTab === 'events') endpoint = '/api/v1/events/my-events/';
        else if (activeTab === 'ngos') endpoint = '/api/v1/ngo/my-ngos/';
        else if (activeTab === 'settings') endpoint = '/api/v1/auth/user/';

        if (endpoint) {
          const res = await fetch(`${baseUrl}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.status === 401 || res.status === 403) {
            logout();
            window.location.href = '/';
            return;
          }
          if (!res.ok) throw new Error(`Failed to fetch ${activeTab}`);
          const result = await res.json();
          if (activeTab === 'settings') {
            setProfileData({
              first_name: result.first_name || '',
              last_name: result.last_name || '',
              phone_number: result.phone_number || ''
            });
            setData([result]); // Hack to bypass the empty state
          } else {
            setData(result.results || result);
          }
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
    { id: 'events', label: 'My Events', icon: 'event' },
    { id: 'ngos', label: 'My NGOs', icon: 'volunteer_activism' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMsg("");
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const res = await fetch(`${baseUrl}/api/v1/auth/user/`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      
      if (res.ok) {
        setProfileMsg("Profile updated successfully!");
      } else {
        const errData = await res.json();
        setProfileMsg(errData.detail || "Failed to update profile.");
      }
    } catch (err) {
      setProfileMsg("An error occurred while updating profile.");
    } finally {
      setUpdatingProfile(false);
      setTimeout(() => setProfileMsg(""), 4000);
    }
  };

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

          {deleteMsg && activeTab !== 'settings' && (
            <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-6 font-medium text-center">
              {deleteMsg}
            </div>
          )}

          {activeTab === 'settings' && data.length > 0 && (
            <form onSubmit={handleProfileUpdate} className="max-w-xl mx-auto mt-6">
              {profileMsg && (
                <div className={`p-4 rounded-xl mb-6 font-medium text-center ${profileMsg.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {profileMsg}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-deep mb-2">First Name</label>
                  <input 
                    type="text" 
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-deep mb-2">Last Name</label>
                  <input 
                    type="text" 
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-ink-deep mb-2">Phone Number</label>
                <input 
                  type="text" 
                  value={profileData.phone_number}
                  readOnly
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 outline-none text-secondary cursor-not-allowed"
                />
                <p className="text-xs text-secondary mt-1">Phone number cannot be changed directly.</p>
              </div>
              
              <button 
                type="submit" 
                disabled={updatingProfile}
                className="w-full bg-primary hover:bg-primary-deep text-white font-bold py-3 rounded-lg transition-colors shadow-md disabled:opacity-50"
              >
                {updatingProfile ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          )}

          {activeTab !== 'overview' && activeTab !== 'settings' && !loading && !error && data.length === 0 && (
            <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-dashed border-hairline-soft flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-secondary/50 mb-3 block">search_off</span>
              <p className="text-secondary font-medium mb-4">No records found.</p>
              {activeTab === 'listings' && (
                <Link href="/add-listing" className="bg-primary hover:bg-primary-deep text-white font-bold px-6 py-2 rounded-full transition-all text-sm">
                  Add Your First Listing
                </Link>
              )}
              {(activeTab === 'saved-listings' || activeTab === 'my-jobs' || activeTab === 'saved-jobs' || activeTab === 'applications') && (
                <Link href={activeTab.includes('job') || activeTab === 'applications' ? "/jobs" : "/"} className="bg-primary hover:bg-primary-deep text-white font-bold px-6 py-2 rounded-full transition-all text-sm">
                  Explore {activeTab.includes('job') || activeTab === 'applications' ? "Jobs" : "Directory"}
                </Link>
              )}
              {activeTab === 'events' && (
                <Link href="/add-event" className="bg-primary hover:bg-primary-deep text-white font-bold px-6 py-2 rounded-full transition-all text-sm">
                  Add New Event
                </Link>
              )}
              {activeTab === 'ngos' && (
                <Link href="/add-ngo" className="bg-primary hover:bg-primary-deep text-white font-bold px-6 py-2 rounded-full transition-all text-sm">
                  Register NGO
                </Link>
              )}
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'settings' && !loading && !error && data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.map((item: any, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-hairline-soft shadow-sm hover:border-primary transition-all">
                  {/* Generic rendering of items based on active tab */}
                  {(activeTab === 'listings' || activeTab === 'saved-listings') && (
                    <>
                      <h4 className="font-bold text-ink-deep mb-2">{item.business_name || item.shop_listing?.business_name}</h4>
                      <p className="text-sm text-secondary mb-4 line-clamp-2">{item.business_description || item.shop_listing?.business_description}</p>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-hairline-soft">
                        <Link href={`/directory/${item.slug || item.shop_listing?.slug}`} className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">visibility</span> View
                        </Link>
                        {activeTab === 'listings' && (
                          <div className="flex gap-3">
                            <Link href={`/add-job?listing_id=${item.id}&company_name=${encodeURIComponent(item.business_name || item.shop_listing?.business_name || '')}`} className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">work</span> List Job
                            </Link>
                            <Link href={`/edit-listing/${item.slug}`} className="text-emerald-600 font-bold text-sm hover:underline flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                            </Link>
                            <button onClick={() => handleDeleteListing(item.slug)} className="text-red-500 font-bold text-sm hover:underline flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {(activeTab === 'my-jobs' || activeTab === 'saved-jobs') && (
                    <>
                      <h4 className="font-bold text-ink-deep mb-2">{item.title || item.job?.title}</h4>
                      <p className="text-sm text-secondary mb-4">{item.company || item.job?.company}</p>
                      <div className="flex gap-4">
                        <Link href={`/jobs/${item.slug || item.job?.slug}`} className="text-primary font-bold text-sm hover:underline">
                          View Job &rarr;
                        </Link>
                        {activeTab === 'my-jobs' && (
                          <Link href={`/account/jobs/${item.id}/applications`} className="text-emerald-600 font-bold text-sm hover:underline">
                            Manage Applications &rarr;
                          </Link>
                        )}
                      </div>
                    </>
                  )}
                  {activeTab === 'applications' && (
                    <>
                      <h4 className="font-bold text-ink-deep mb-2">Job: {item.job_title}</h4>
                      <p className="text-sm text-secondary mb-4">Status: <span className="font-bold uppercase text-primary">{item.status}</span></p>
                      <span className="text-xs text-secondary">Applied on: {new Date(item.applied_at).toLocaleDateString()}</span>
                    </>
                  )}
                  {activeTab === 'events' && (
                    <>
                      <h4 className="font-bold text-ink-deep mb-2">{item.title}</h4>
                      <p className="text-sm text-secondary mb-4 line-clamp-2">{item.short_description}</p>
                      <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-md">Status: {item.status}</span>
                    </>
                  )}
                  {activeTab === 'ngos' && (
                    <>
                      <h4 className="font-bold text-ink-deep mb-2">{item.name}</h4>
                      <p className="text-sm text-secondary mb-4 line-clamp-2">{item.description}</p>
                      <span className="text-xs font-bold px-2 py-1 rounded-md text-emerald-700 bg-emerald-100">Verified: {item.is_verified ? 'Yes' : 'Pending'}</span>
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
