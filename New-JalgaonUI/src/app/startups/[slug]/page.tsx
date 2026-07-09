import React from 'react';
import Script from 'next/script';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StartupDetailClient from './StartupDetailClient';

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
    const res = await fetch(`${baseUrl}/api/v1/startups/${safeSlug}/`);
    if (res.ok) {
      const data = await res.json();
      return {
        title: `${data.name} | Jalgaon Startup Ecosystem`,
        description: data.meta_description || data.description?.slice(0, 160) || data.name,
      };
    }
  } catch (e) {
    // ignore
  }
  return { title: 'Startup Details | Jalgaon.com' };
}

export default async function StartupPage({ params }: { params: Promise<{ slug: string }> }) {
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
    const res = await fetch(`${baseUrl}/api/v1/startups/${safeSlug}/`);
    if (res.ok) {
      const data = await res.json();
      const logoUrl = data.logo
        ? (data.logo.startsWith('http') ? data.logo : `${baseUrl}${data.logo}`)
        : '';

      schemas.push({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": data.name,
        "image": logoUrl ? [logoUrl] : [],
        "description": data.description,
        "email": data.email || undefined,
        "telephone": data.phone || undefined,
        "address": data.address ? {
          "@type": "PostalAddress",
          "streetAddress": data.address,
          "addressLocality": "Jalgaon",
          "addressRegion": "Maharashtra",
          "addressCountry": "IN"
        } : undefined,
        "url": data.website || undefined,
        "foundingDate": data.founding_year ? `${data.founding_year}-01-01` : undefined
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
            "name": "Startups",
            "item": "https://www.jalgaon.com/startups"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": data.industry?.name || "Local Startups",
            "item": `https://www.jalgaon.com/startups?industry=${data.industry?.slug || ''}`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": data.name,
            "item": `https://www.jalgaon.com/startups/${slug}`
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
      <main className="min-h-screen bg-surface-container-lowest">
        <StartupDetailClient slug={slug} />
      </main>
      <Footer />
    </>
  );
}
