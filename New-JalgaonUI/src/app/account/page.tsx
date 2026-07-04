import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DashboardClient from './DashboardClient';

export default function AccountPage() {
  return (
    <>
      <Header />
      <main className="flex-grow bg-surface py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <DashboardClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
