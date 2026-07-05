import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsDetailClient from './NewsDetailClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const { slug } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${baseUrl}/api/v1/news/${resolvedParams.slug}/`);
    if (res.ok) {
      const data = await res.json();
      return {
        title: `${data.title} | Jalgaon News`,
        description: data.short_description || data.title,
      };
    }
  } catch (e) {
    // ignore
  }
  return { title: 'News Article | Jalgaon.com' };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return (
    <>
      <Header />
      <main className="flex-grow py-section px-base bg-surface">
        <div className="max-w-4xl mx-auto py-xl">
          <NewsDetailClient slug={resolvedParams.slug} />
        </div>
      </main>
      <Footer />
    </>
  );
}
