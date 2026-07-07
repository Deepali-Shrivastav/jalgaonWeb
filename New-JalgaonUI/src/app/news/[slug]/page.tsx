import React from 'react';
import Script from 'next/script';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsDetailClient from './NewsDetailClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const safeSlug = (() => {
    try {
      return encodeURIComponent(decodeURIComponent(slug));
    } catch {
      return encodeURIComponent(slug);
    }
  })();
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${baseUrl}/api/v1/news/${safeSlug}/`);
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
  const { slug } = await params;
  const safeSlug = (() => {
    try {
      return encodeURIComponent(decodeURIComponent(slug));
    } catch {
      return encodeURIComponent(slug);
    }
  })();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let schemas: any[] = [];

  try {
    const res = await fetch(`${baseUrl}/api/v1/news/${safeSlug}/`);
    if (res.ok) {
      const data = await res.json();
      schemas.push({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": data.title,
        "image": data.featured_image ? [data.featured_image.startsWith('http') ? data.featured_image : `${baseUrl}${data.featured_image}`] : [],
        "datePublished": data.published_at || data.created_at,
        "dateModified": data.updated_at,
        "author": [{
            "@type": "Person",
            "name": data.author_name || "Jalgaon.com Staff"
        }],
        "description": data.short_description || data.title
      });

      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.jalgaon.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "News",
            "item": "https://www.jalgaon.com/news"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": data.category_name || "Local News",
            "item": `https://www.jalgaon.com/news?category=${data.category_slug || ''}`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": data.title,
            "item": `https://www.jalgaon.com/news/${slug}`
          }
        ]
      });
    }
  } catch (e) {
    // ignore
  }

  return (
    <>
      {schemas.length > 0 && (
        <Script
          id={`schema-${slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        />
      )}
      <Header />
      <main className="flex-grow bg-white">
        <NewsDetailClient slug={slug} />
      </main>
      <Footer />
    </>
  );
}
