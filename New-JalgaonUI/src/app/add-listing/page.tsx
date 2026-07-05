import type { Metadata } from 'next';
import AddListingClient from './AddListingClient';

export const metadata: Metadata = {
  title: 'Add Business Listing | Jalgaon.com',
  description: 'List your business on Jalgaon.com to connect with thousands of local customers. Fast, reliable, and effective local business directory for Jalgaon and North Maharashtra.',
  keywords: [
    'Add business Jalgaon',
    'Jalgaon business directory',
    'List business in Jalgaon',
    'Jalgaon local business',
    'Promote business Jalgaon',
  ],
  openGraph: {
    title: 'List Your Business | Jalgaon.com',
    description: 'Join Jalgaon\'s most comprehensive business directory and connect with thousands of local customers daily.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Jalgaon.com',
    url: '/add-listing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'List Your Business | Jalgaon.com',
    description: 'Join Jalgaon\'s most comprehensive business directory and connect with thousands of local customers daily.',
  },
  alternates: {
    canonical: '/add-listing',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AddListingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Add Business Listing | Jalgaon.com",
    "description": "List your business on Jalgaon.com to connect with thousands of local customers.",
    "url": "https://jalgaon.com/add-listing",
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
      <AddListingClient />
    </>
  );
}
