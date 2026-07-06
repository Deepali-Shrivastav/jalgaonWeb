'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DashboardClient from '@/app/account/DashboardClient';

export default function UserProfileContent({ activeTab }: { activeTab: string }) {
  return (
    <>
      <Header />
      <main className="flex-grow bg-surface py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <DashboardClient initialTab={activeTab} />
        </div>
      </main>
      <Footer />
    </>
  );
}
