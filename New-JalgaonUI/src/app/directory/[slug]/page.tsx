import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BusinessDetailClient from './BusinessDetailClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${baseUrl}/api/v1/listings/${slug}/`);
    
    if (res.ok) {
      const data = await res.json();
      return {
        title: `${data.business_name} | Jalgaon Directory`,
        description: data.business_description || `View details, contact information, and reviews for ${data.business_name}.`,
        openGraph: {
          title: `${data.business_name} | Jalgaon.com`,
          description: data.business_description,
          images: data.business_banner ? [data.business_banner.startsWith('http') ? data.business_banner : `${baseUrl}${data.business_banner}`] : [],
        }
      };
    }
  } catch (e) {
    // ignore and fallback
  }
  return { title: 'Business Directory | Jalgaon.com' };
}

export default async function BusinessDirectoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <>
      <Header />
      <main className="flex-grow bg-surface min-h-screen">
        <BusinessDetailClient slug={slug} />
      </main>
      <Footer />
    </>
  );
}
