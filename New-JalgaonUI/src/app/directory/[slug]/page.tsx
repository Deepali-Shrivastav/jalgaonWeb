import React from 'react';
import Script from 'next/script';
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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let schemas: any[] = [];

  try {
    const res = await fetch(`${baseUrl}/api/v1/listings/${slug}/`);
    if (res.ok) {
      const data = await res.json();
      schemas.push({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": data.business_name,
        "image": data.business_banner ? (data.business_banner.startsWith('http') ? data.business_banner : `${baseUrl}${data.business_banner}`) : undefined,
        "description": data.business_description,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": data.address,
          "addressLocality": data.city || "Jalgaon",
          "addressRegion": "Maharashtra",
          "postalCode": data.pincode,
          "addressCountry": "IN"
        },
        "telephone": data.contact_person_number,
        "email": data.email,
        "url": `https://www.jalgaon.com/directory/${slug}`,
        "aggregateRating": data.avg_rating ? {
          "@type": "AggregateRating",
          "ratingValue": data.avg_rating,
          "reviewCount": data.total_reviews || 1
        } : undefined
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
            "name": "Directory",
            "item": "https://www.jalgaon.com/directory"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": data.main_category_name || "Business",
            "item": `https://www.jalgaon.com/category/${data.main_category_slug || ''}`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": data.business_name,
            "item": `https://www.jalgaon.com/directory/${slug}`
          }
        ]
      });
    }
  } catch (e) {
    // Ignore error, schema won't be rendered
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
      <main className="flex-grow bg-surface min-h-screen">
        <BusinessDetailClient slug={slug} />
      </main>
      <Footer />
    </>
  );
}
