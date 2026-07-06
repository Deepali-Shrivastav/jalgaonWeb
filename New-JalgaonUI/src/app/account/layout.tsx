'use client';

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DashboardSidebar from '@/components/account/DashboardSidebar';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { isLogin } = useContext(AuthContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <>
        <Header />
        <main className="flex-grow bg-surface py-12 px-6">
          <div className="max-w-7xl mx-auto flex justify-center items-center py-20">
            <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // If not logged in and there is no token in localStorage, show Login Required
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
  if (!isLogin && !hasToken) {
    return (
      <>
        <Header />
        <main className="flex-grow bg-surface py-12 px-6">
          <div className="max-w-[448px] mx-auto bg-white rounded-2xl p-12 text-center shadow-sm border border-hairline-soft my-10">
            <span className="material-symbols-outlined text-6xl text-secondary mb-4 block">lock</span>
            <h2 className="text-2xl font-bold text-ink-deep mb-2">Login Required</h2>
            <p className="text-secondary mb-6">Please log in to access your dashboard.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // If there is a token but AuthContext has not finished loading user, show spinner
  if (!isLogin && hasToken) {
    return (
      <>
        <Header />
        <main className="flex-grow bg-surface py-12 px-6">
          <div className="max-w-7xl mx-auto flex justify-center items-center py-20">
            <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-grow bg-surface py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <DashboardSidebar />
            </div>
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-hairline-soft min-h-[600px]">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
