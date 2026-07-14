import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BusinessListings from '@/components/BusinessListings';

import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string }> }): Promise<Metadata> {
  const { categorySlug } = await params;
  
  // Format slug to readable category name (e.g. real-estate -> Real Estate)
  const categoryName = categorySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `List of Top ${categoryName} in Jalgaon - Best ${categoryName} near me - Jalgaon.com`,
    description: `Find the top-rated ${categoryName} businesses and services in Jalgaon. Read reviews, get contact details, and find locations on Jalgaon.com.`,
    alternates: {
      canonical: `https://www.jalgaon.com/category/${categorySlug}`,
    },
    openGraph: {
      title: `List of Top ${categoryName} in Jalgaon - Best ${categoryName} near me - Jalgaon.com`,
      description: `Find the top-rated ${categoryName} businesses and services in Jalgaon.`,
      url: `https://www.jalgaon.com/category/${categorySlug}`,
      type: 'website',
    }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;
  
  return (
    <>
      <Header />
      <main className="flex-grow bg-surface min-h-screen">
        <BusinessListings category={categorySlug} selectedCity="Jalgaon" />
      </main>
      <Footer />
    </>
  );
}
