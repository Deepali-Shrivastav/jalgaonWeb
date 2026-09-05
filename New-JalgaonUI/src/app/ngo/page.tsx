import type { Metadata } from 'next';
import NgoClient from './NgoClient';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'NGOs in Jalgaon | Volunteer, Donate, Charities, Social Work & Community Service',
  description: 'Connect with local non-profits driving real change in healthcare, education, and sustainability across Jalgaon district. Find verified NGOs, volunteer, or donate.',
  keywords: [
    'Jalgaon NGO',
    'volunteer in Jalgaon',
    'donate Jalgaon',
    'charities in Jalgaon',
    'Jalgaon social work',
    'Jalgaon community service',
  ],
  openGraph: {
    title: 'NGOs in Jalgaon | Volunteer, Donate, Charities, Social Work & Community Service',
    description: 'Connect with local non-profits driving real change across Jalgaon district.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Jalgaon.com',
    url: '/ngo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jalgaon NGOs | Support Local Charities',
    description: 'Connect with local non-profits driving real change across Jalgaon district.',
  },
  alternates: {
    canonical: '/ngo',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function NgoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Jalgaon NGOs",
    "description": "Directory of verified Non-Governmental Organizations in Jalgaon.",
    "url": "https://jalgaon.com/ngo",
    "publisher": {
      "@type": "Organization",
      "name": "Jalgaon.com",
      "url": "https://jalgaon.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://jalgaon.com/icon.png"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NgoClient />
      <Footer />
    </>
  );
}
