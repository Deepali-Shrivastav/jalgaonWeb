import type { Metadata } from 'next';
import EventsPortal from './EventsPortal';

export const metadata: Metadata = {
  title: 'Jalgaon Events — Discover Local Events, Festivals & Community Gatherings | Jalgaon.com',
  description:
    'Find upcoming events in Jalgaon — cultural festivals, business summits, sports tournaments, community meetups, and more. Plan your calendar with local happenings.',
  keywords: [
    'Jalgaon events',
    'events in Jalgaon',
    'Jalgaon festivals',
    'Jalgaon cultural events',
    'Jalgaon business events',
    'things to do in Jalgaon',
    'Jalgaon community events',
    'Khandesh festivals',
  ],
  openGraph: {
    title: 'Discover Events in Jalgaon — Festivals, Summits & More',
    description:
      'From vibrant local festivals to grand business summits, find exactly what\'s happening in Jalgaon.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Jalgaon.com',
    url: '/events',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Events in Jalgaon',
    description:
      'Cultural festivals, business summits, sports tournaments and more — find what\'s happening in your city.',
  },
  alternates: {
    canonical: '/events',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function EventsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Jalgaon Events',
    description: 'Discover upcoming events, festivals, and gatherings in Jalgaon.',
    url: 'https://jalgaon.com/events',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Event',
            name: 'Jalgaon Heritage & Cultural Fest 2024',
            startDate: '2024-12-18',
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            eventStatus: 'https://schema.org/EventScheduled',
            location: {
              '@type': 'Place',
              name: 'Tapovan Grounds',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Jalgaon',
                addressRegion: 'Maharashtra',
                addressCountry: 'IN',
              },
            },
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
            organizer: { '@type': 'Organization', name: 'Jalgaon.com' },
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'Event',
            name: 'North Maharashtra Tech Summit',
            startDate: '2025-01-05',
            location: {
              '@type': 'Place',
              name: 'Jain Hills',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Jalgaon',
                addressRegion: 'Maharashtra',
                addressCountry: 'IN',
              },
            },
            offers: { '@type': 'Offer', price: '499', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
          },
        },
        {
          '@type': 'ListItem',
          position: 3,
          item: {
            '@type': 'Event',
            name: 'Classical Music Night with Pandit R. Sharma',
            startDate: '2024-12-22T19:00:00+05:30',
            location: {
              '@type': 'Place',
              name: 'Prasad Hall',
              address: { '@type': 'PostalAddress', addressLocality: 'Jalgaon', addressRegion: 'Maharashtra', addressCountry: 'IN' },
            },
            offers: { '@type': 'Offer', price: '250', priceCurrency: 'INR' },
          },
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EventsPortal />
    </>
  );
}
