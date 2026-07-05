import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BusinessListings from '@/components/BusinessListings';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  
  return (
    <>
      <Header />
      <main className="flex-grow bg-surface min-h-screen">
        <BusinessListings searchQuery={q} selectedCity="Jalgaon" />
      </main>
      <Footer />
    </>
  );
}
