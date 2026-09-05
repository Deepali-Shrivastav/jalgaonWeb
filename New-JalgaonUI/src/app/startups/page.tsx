import type { Metadata } from 'next';
import StartupsClient from './StartupsClient';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Startups in Jalgaon | Local Companies, Founders, Business Ideas, Funding & Opportunities',
  description: 'Explore the Jalgaon startup ecosystem. Discover local startups, innovative founders, funding stages, and tech communities building the future in Jalgaon district.',
  keywords: [
    'Jalgaon startups',
    'startups in Jalgaon',
    'Jalgaon entrepreneurs',
    'local businesses Jalgaon',
    'technology hubs Jalgaon',
    'Jalgaon innovation',
  ],
  openGraph: {
    title: 'Startups in Jalgaon | Local Companies, Founders, Business Ideas, Funding & Opportunities',
    description: 'Explore the Jalgaon startup ecosystem. Discover local startups, founders, and tech communities.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Jalgaon.com',
    url: '/startups',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jalgaon Startup Directory | Local Entrepreneurs & Innovators',
    description: 'Explore the Jalgaon startup ecosystem. Discover local startups, founders, and tech communities.',
  },
  alternates: {
    canonical: '/startups',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function StartupsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Jalgaon Startup Directory",
    "description": "Directory of verified startups and founders building the ecosystem in Jalgaon.",
    "url": "https://jalgaon.com/startups",
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
      <StartupsClient />
      <Footer />
    </>
  );
}
