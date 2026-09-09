import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BusinessListings from '@/components/BusinessListings';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Directory in Jalgaon | Local Phone & Shop Directory | Jalgaon.com',
  description: 'Explore the complete local business directory of Jalgaon. Find top-rated shops, emergency services, offices, contacts, and addresses in Jalgaon.',
  alternates: {
    canonical: 'https://www.jalgaon.com/directory',
  },
  openGraph: {
    title: 'Business Directory in Jalgaon | Jalgaon.com',
    description: 'Explore the complete local business directory of Jalgaon.',
    url: 'https://www.jalgaon.com/directory',
    type: 'website',
  }
};

export default function DirectoryPage() {
  return (
    <>
      <Header />
      <main className="flex-grow bg-surface min-h-screen">
        <BusinessListings selectedCity="Jalgaon" />
      </main>
      <Footer />
    </>
  );
}
