import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsDetailClient from './NewsDetailClient';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${baseUrl}/api/v1/news/${params.slug}/`);
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

export default function NewsArticlePage({ params }: { params: { slug: string } }) {
  return (
    <>
      <Header />
      <main className="flex-grow py-section px-base bg-surface">
        <div className="max-w-4xl mx-auto py-xl">
          <NewsDetailClient slug={params.slug} />
        </div>
      </main>
      <Footer />
    </>
  );
}
