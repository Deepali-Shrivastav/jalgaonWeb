import React from 'react';
import Script from 'next/script';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JobDetailClient from './JobDetailClient';

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
    const res = await fetch(`${baseUrl}/api/v1/jobs/${safeSlug}/`);
    if (res.ok) {
      const data = await res.json();
      return {
        title: `${data.title} at ${data.company} | Jalgaon Jobs`,
        description: `Apply for ${data.title} at ${data.company} in ${data.location}.`,
      };
    }
  } catch (e) {
    // ignore
  }
  return { title: 'Job Details | Jalgaon.com' };
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
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
    const res = await fetch(`${baseUrl}/api/v1/jobs/${safeSlug}/`);
    if (res.ok) {
      const data = await res.json();
      
      schemas.push({
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": data.title,
        "description": data.description || `Job opening for ${data.title} at ${data.company}.`,
        "identifier": {
          "@type": "PropertyValue",
          "name": data.company,
          "value": data.id
        },
        "datePosted": data.created_at || new Date().toISOString(),
        "validThrough": data.expires_at || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        "employmentType": data.type || "FULL_TIME",
        "hiringOrganization": {
          "@type": "Organization",
          "name": data.company,
          "sameAs": "https://www.jalgaon.com"
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": data.location || "Jalgaon",
            "addressRegion": "Maharashtra",
            "addressCountry": "IN"
          }
        },
        "baseSalary": data.salary ? {
          "@type": "MonetaryAmount",
          "currency": "INR",
          "value": {
            "@type": "QuantitativeValue",
            "value": data.salary
          }
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
            "name": "Jobs",
            "item": "https://www.jalgaon.com/jobs"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": data.title,
            "item": `https://www.jalgaon.com/jobs/${slug}`
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
      <main className="flex-grow py-section px-base bg-surface">
        <div className="max-w-4xl mx-auto py-xl">
          <JobDetailClient slug={slug} />
        </div>
      </main>
      <Footer />
    </>
  );
}
