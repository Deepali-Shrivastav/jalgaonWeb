import type { Metadata } from 'next';
import ClubsClient from './ClubsClient';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Jalgaon Club Directory | Local Social, Sports & Cultural Clubs',
  description: 'Explore social, cultural, sports, educational, and environmental clubs in Jalgaon. Connect with local communities, explore active clubs, and join weekend activities.',
  keywords: [
    'Jalgaon clubs',
    'clubs in Jalgaon',
    'social clubs Jalgaon',
    'sports clubs Jalgaon',
    'cultural clubs Jalgaon',
    'trekking groups Jalgaon',
  ],
  openGraph: {
    title: 'Jalgaon Club Directory | Local Social, Sports & Cultural Clubs',
    description: 'Explore social, cultural, sports, educational, and environmental clubs in Jalgaon. Connect with local communities.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Jalgaon.com',
    url: '/clubs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jalgaon Club Directory | Local Social, Sports & Cultural Clubs',
    description: 'Explore social, cultural, sports, educational, and environmental clubs in Jalgaon. Connect with local communities.',
  },
  alternates: {
    canonical: '/clubs',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ClubsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Jalgaon Club Directory",
    "description": "Directory of verified sports, cultural, social, and hobby clubs active in Jalgaon district.",
    "url": "https://jalgaon.com/clubs",
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
      <ClubsClient />
      <Footer />
    </>
  );
}
