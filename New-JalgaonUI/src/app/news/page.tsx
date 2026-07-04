import type { Metadata } from 'next';
import NewsPortal from './NewsPortal';

export const metadata: Metadata = {
  title: 'Jalgaon News — Latest Local News, Business Updates & Community Stories | Jalgaon.com',
  description:
    'Stay updated with the latest news from Jalgaon. Read breaking stories, business updates, community happenings, and economy insights from North Maharashtra\'s commercial capital.',
  keywords: [
    'Jalgaon news',
    'Jalgaon local news',
    'Jalgaon business news',
    'Khandesh news',
    'North Maharashtra news',
    'Jalgaon community updates',
    'Jalgaon economy',
    'Jalgaon gold market',
  ],
  openGraph: {
    title: 'Jalgaon News — Latest Local News & Community Stories',
    description:
      'Stay updated with breaking stories, business updates, and community happenings from Jalgaon district.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Jalgaon.com',
    url: '/news',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jalgaon News — Latest Local News & Community Stories',
    description:
      'Stay updated with breaking stories, business updates, and community happenings from Jalgaon.',
  },
  alternates: {
    canonical: '/news',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function NewsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Jalgaon News',
    description:
      'Latest local news, business updates, and community stories from Jalgaon, Maharashtra.',
    url: 'https://jalgaon.com/news',
    publisher: {
      '@type': 'Organization',
      name: 'Jalgaon.com',
      url: 'https://jalgaon.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://jalgaon.com/logo.png',
      },
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'NewsArticle',
            headline:
              "Revolutionizing Local Trade: Jalgaon's Digital Transformation",
            datePublished: '2024-10-24T10:00:00+05:30',
            author: { '@type': 'Organization', name: 'Jalgaon.com' },
            publisher: { '@type': 'Organization', name: 'Jalgaon.com' },
            description:
              "How local businesses are leveraging the new directory ecosystem to reach global markets while maintaining their deep roots in the Khandesh region's rich commercial heritage.",
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'NewsArticle',
            headline: 'Start-up Hub Launches in Jalgaon MIDC',
            datePublished: '2024-10-24T08:00:00+05:30',
            author: { '@type': 'Organization', name: 'Jalgaon.com' },
            publisher: { '@type': 'Organization', name: 'Jalgaon.com' },
          },
        },
        {
          '@type': 'ListItem',
          position: 3,
          item: {
            '@type': 'NewsArticle',
            headline: 'Annual Cultural Fest Returns to Gandhi Garden',
            datePublished: '2024-10-24T07:00:00+05:30',
            author: { '@type': 'Organization', name: 'Jalgaon.com' },
            publisher: { '@type': 'Organization', name: 'Jalgaon.com' },
          },
        },
        {
          '@type': 'ListItem',
          position: 4,
          item: {
            '@type': 'NewsArticle',
            headline: 'Gold Market Sees Steady Growth in Festive Quarter',
            datePublished: '2024-10-24T06:00:00+05:30',
            author: { '@type': 'Organization', name: 'Jalgaon.com' },
            publisher: { '@type': 'Organization', name: 'Jalgaon.com' },
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
      <NewsPortal />
    </>
  );
}
