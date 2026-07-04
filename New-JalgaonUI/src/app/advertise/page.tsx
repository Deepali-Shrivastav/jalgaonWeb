import type { Metadata } from 'next';
import AdvertiseClient from './AdvertiseClient';

export const metadata: Metadata = {
  title: 'Advertise Your Business | Jalgaon.com',
  description: 'Promote your business on Jalgaon.com and reach thousands of local customers. Flexible advertising options for Automotive, Real Estate, Healthcare, Education, and more.',
  keywords: [
    'advertise in Jalgaon',
    'Jalgaon business marketing',
    'Jalgaon local advertising',
    'promote business Jalgaon',
    'Jalgaon digital marketing',
  ],
  openGraph: {
    title: 'Advertise Your Business | Jalgaon.com',
    description: 'Promote your business on Jalgaon.com and reach thousands of local customers.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Jalgaon.com',
    url: '/advertise',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Advertise Your Business | Jalgaon.com',
    description: 'Promote your business on Jalgaon.com and reach thousands of local customers.',
  },
  alternates: {
    canonical: '/advertise',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AdvertisePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Advertise Your Business | Jalgaon.com",
    "description": "Advertising platform for businesses in Jalgaon.",
    "url": "https://jalgaon.com/advertise",
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
      <AdvertiseClient />
    </>
  );
}
