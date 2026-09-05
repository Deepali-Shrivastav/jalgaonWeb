import type { Metadata } from 'next';
import GlimpsePortal from './GlimpsePortal';
import { YouTubeVideoListResponse } from '@/types/youtube';

export const metadata: Metadata = {
  title: 'Jalgaon Glimpse | Watch Local News, Events & Highlights',
  description:
    'Watch the latest videos, local news coverage, business stories, and YouTube Shorts from Jalgaon, Maharashtra on Jalgaon.com.',
  keywords: [
    'Jalgaon Glimpse',
    'Jalgaon videos',
    'Jalgaon YouTube videos',
    'Jalgaon shorts',
    'Jalgaon news videos',
    'Jalgaon local highlights',
    'North Maharashtra video stories',
  ],
  openGraph: {
    title: 'Jalgaon Glimpse | Watch Local News & Highlights',
    description:
      'Watch local stories, news coverage, and community video highlights from Jalgaon district.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Jalgaon.com',
    url: '/jalgaon-glimpse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jalgaon Glimpse — Official Video Hub',
    description:
      'Watch local stories, news coverage, and community video highlights from Jalgaon.',
  },
  alternates: {
    canonical: '/jalgaon-glimpse',
  },
  robots: {
    index: true,
    follow: true,
  },
};

async function getInitialVideos(): Promise<YouTubeVideoListResponse | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${baseUrl}/api/v1/jalgaon-glimpse/videos/?max_results=12`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('Failed to pre-fetch YouTube videos on server:', err);
    return null;
  }
}

export default async function JalgaonGlimpsePage() {
  const initialData = await getInitialVideos();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Jalgaon Glimpse',
    description:
      'Official video portal for Jalgaon district featuring news coverage, events, and community updates.',
    url: 'https://jalgaon.com/jalgaon-glimpse',
    publisher: {
      '@type': 'Organization',
      name: 'Jalgaon.com',
      url: 'https://jalgaon.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://jalgaon.com/main-logo.png',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GlimpsePortal initialData={initialData} />
    </>
  );
}
