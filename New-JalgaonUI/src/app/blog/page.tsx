import type { Metadata } from 'next';
import BlogPortal from './BlogPortal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Jalgaon Blog — Local Stories, Ideas, and Insights | Jalgaon.com',
  description:
    'Discover stories, expert business guides, local history, travel guides, and cultural perspectives from the residents and writers of Jalgaon district.',
  keywords: [
    'Jalgaon blog',
    'Jalgaon local stories',
    'Jalgaon guides',
    'Mehrun lake',
    'Jalgaon travel',
    'Jalgaon business guide',
    'Khandesh stories',
  ],
  openGraph: {
    title: 'Jalgaon Blog — Local Stories, Ideas & Insights',
    description:
      'Discover stories, expert business guides, local history, and cultural perspectives from the residents and writers of Jalgaon.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Jalgaon.com',
    url: '/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jalgaon Blog — Local Stories, Ideas & Insights',
    description:
      'Discover stories, expert business guides, local history, and cultural perspectives from Jalgaon.',
  },
  alternates: {
    canonical: '/blog',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Jalgaon Blog',
    description:
      'Local stories, expert business guides, local history, and cultural perspectives from Jalgaon.',
    url: 'https://jalgaon.com/blog',
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
      <Header />
      <main className="min-h-screen bg-surface-container-lowest">
        <BlogPortal />
      </main>
      <Footer />
    </>
  );
}
