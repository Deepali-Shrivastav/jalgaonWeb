import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BusinessListings from '@/components/BusinessListings';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <>
      <Header />
      <main className="flex-grow bg-surface min-h-screen">
        <BusinessListings category={slug} selectedCity="Jalgaon" />
      </main>
      <Footer />
    </>
  );
}
