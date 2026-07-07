import React from 'react';
import Script from 'next/script';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EventDetailClient from './EventDetailClient';

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
    const res = await fetch(`${baseUrl}/api/v1/events/${safeSlug}/`);
    if (res.ok) {
      const data = await res.json();
      return {
        title: `${data.title} | Jalgaon Events`,
        description: data.short_description || data.title,
      };
    }
  } catch (e) {
    // ignore
  }
  return { title: 'Event Details | Jalgaon.com' };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
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
    const res = await fetch(`${baseUrl}/api/v1/events/${safeSlug}/`);
    if (res.ok) {
      const data = await res.json();
      
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Event",
        "name": data.title,
        "startDate": data.start_datetime,
        "endDate": data.end_datetime || data.start_datetime,
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "location": {
          "@type": "Place",
          "name": data.venue_name || "Jalgaon",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": data.venue_address || data.venue_name,
            "addressLocality": data.city || "Jalgaon",
            "addressRegion": "Maharashtra",
            "addressCountry": "IN"
          }
        },
        "image": data.featured_image ? [data.featured_image.startsWith('http') ? data.featured_image : `${baseUrl}${data.featured_image}`] : [],
        "description": data.short_description || data.description || data.title,
        "offers": {
          "@type": "Offer",
          "url": `https://www.jalgaon.com/events/${slug}`,
          "price": data.ticket_price || "0",
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock",
          "validFrom": data.created_at
        },
        "organizer": {
          "@type": "Organization",
          "name": data.organizer_name || "Jalgaon.com",
          "url": "https://www.jalgaon.com"
        }
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
            "name": "Events",
            "item": "https://www.jalgaon.com/events"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": data.title,
            "item": `https://www.jalgaon.com/events/${slug}`
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
          <EventDetailClient slug={slug} />
        </div>
      </main>
      <Footer />
    </>
  );
}
