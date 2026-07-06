import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BusinessListings from '@/components/BusinessListings';

import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  // Format slug to readable category name (e.g. real-estate -> Real Estate)
  const categoryName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `Best ${categoryName} in Jalgaon | Jalgaon.com`,
    description: `Find the top-rated ${categoryName} businesses and services in Jalgaon. Read reviews, get contact details, and find locations on Jalgaon.com.`,
    alternates: {
      canonical: `https://www.jalgaon.com/category/${slug}`,
    },
    openGraph: {
      title: `Best ${categoryName} in Jalgaon | Jalgaon.com`,
      description: `Find the top-rated ${categoryName} businesses and services in Jalgaon.`,
      url: `https://www.jalgaon.com/category/${slug}`,
      type: 'website',
    }
  };
}

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
