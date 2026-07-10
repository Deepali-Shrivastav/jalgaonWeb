import React from 'react';
import Script from 'next/script';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClubDetailClient from './ClubDetailClient';

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
    const res = await fetch(`${baseUrl}/api/v1/clubs/${safeSlug}/`);
    if (res.ok) {
      const data = await res.json();
      return {
        title: `${data.name} | Jalgaon Clubs & Activities`,
        description: data.meta_description || data.short_description || data.description?.slice(0, 160) || data.name,
      };
    }
  } catch (e) {
    // ignore
  }
  return { title: 'Club Details | Jalgaon.com' };
}

export default async function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
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
    const res = await fetch(`${baseUrl}/api/v1/clubs/${safeSlug}/`);
    if (res.ok) {
      const data = await res.json();
      const logoUrl = data.logo
        ? (data.logo.startsWith('http') ? data.logo : `${baseUrl}${data.logo}`)
        : '';

      schemas.push({
        "@context": "https://schema.org",
        "@type": "SportsClub", // Standard Schema.org fallback
        "name": data.name,
        "image": logoUrl ? [logoUrl] : [],
        "description": data.description,
        "email": data.contact_email || undefined,
        "telephone": data.contact_phone || undefined,
        "address": data.address ? {
          "@type": "PostalAddress",
          "streetAddress": data.address,
          "addressLocality": "Jalgaon",
          "addressRegion": "Maharashtra",
          "addressCountry": "IN"
        } : undefined,
        "url": data.website || undefined,
        "foundingDate": data.founded_year ? `${data.founded_year}-01-01` : undefined
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
            "name": "Clubs",
            "item": "https://www.jalgaon.com/clubs"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": data.category?.name || "Local Clubs",
            "item": `https://www.jalgaon.com/clubs?category=${data.category?.slug || ''}`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": data.name,
            "item": `https://www.jalgaon.com/clubs/${slug}`
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
        <ClubDetailClient slug={slug} />
      </main>
      <Footer />
    </>
  );
}
