'use client';

import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';

export default function DashboardSidebar() {
  const { user, logout } = useContext(AuthContext);
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { href: '/account/overview', label: 'Overview', icon: 'dashboard' },
    { href: '/account/my-listings', label: 'My Listings', icon: 'storefront' },
    { href: '/account/saved-listings', label: 'Saved Listings', icon: 'favorite' },
    { href: '/account/my-jobs', label: 'My Jobs', icon: 'work' },
    { href: '/account/saved-jobs', label: 'Saved Jobs', icon: 'bookmark' },
    { href: '/account/applications', label: 'My Applications', icon: 'description' },
    { href: '/account/my-events', label: 'My Events', icon: 'event' },
    { href: '/account/my-ngos', label: 'My NGOs', icon: 'volunteer_activism' },
    { href: '/account/my-clubs', label: 'My Clubs', icon: 'groups' },
    { href: '/account/reviews', label: 'Manage Reviews', icon: 'reviews' },
    { href: '/account/ads', label: 'My Ads', icon: 'campaign' },
    { href: '/account/notifications', label: 'Notifications', icon: 'notifications' },
    { href: '/account/activity', label: 'Activity Log', icon: 'history' },
    { href: '/account/settings', label: 'Profile Settings', icon: 'person' },
  ];

  const activeTab = tabs.find(t => pathname === t.href) || tabs[0];
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/notifications/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.results || data.data || data || [];
        if (Array.isArray(list)) {
          setUnreadCount(list.filter((n: any) => !n.is_read).length);
        }
      }
    } catch (err) {
      console.error("Error fetching unread notifications count", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="w-full">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-hairline-soft lg:sticky lg:top-24">
        {/* User Info Block */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-hairline-soft">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
            {user?.phone_number?.[0] || 'U'}
          </div>
          <div>
            <p className="font-bold text-ink-deep">{user?.phone_number || 'User'}</p>
            <p className="text-xs text-secondary capitalize">{user?.role || 'Member'}</p>
          </div>
        </div>

        {/* Super Admin / Admin Dashboard Shortcut */}
        {(user?.role?.toLowerCase() === 'super_admin' || user?.role?.toLowerCase() === 'admin') && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl font-bold text-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            Admin Dashboard
          </Link>
        )}
        
        {/* Mobile Menu Toggle Button */}
        <div className="lg:hidden mb-4">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full bg-surface-container-lowest border border-hairline-soft rounded-xl p-4 flex justify-between items-center text-ink-deep font-bold shadow-sm active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">menu</span>
              {activeTab.label}
            </div>
            <span 
              className="material-symbols-outlined text-secondary transition-transform duration-300"
              style={{ transform: isMobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              expand_more
            </span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className={`flex-col gap-2 ${isMobileMenuOpen ? 'flex' : 'hidden lg:flex'}`}>
          {tabs.map(tab => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                  isActive 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-secondary hover:bg-surface-container-low hover:text-ink-deep'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                  {tab.label}
                </div>
                {tab.label === 'Notifications' && unreadCount > 0 && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-primary' : 'bg-primary text-white'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
          
          <div className="pt-2 mt-2 border-t border-hairline-soft">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Logout
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}
