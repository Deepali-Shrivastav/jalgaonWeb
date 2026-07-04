import type { Metadata } from 'next';
import JobsPortal from './JobsPortal';

export const metadata: Metadata = {
  title: 'Jalgaon Jobs — Latest Job Openings & Career Opportunities | Jalgaon.com',
  description:
    'Find the latest job openings in Jalgaon. Browse full-time, part-time, contract, and internship opportunities across IT, manufacturing, education, finance, and more.',
  keywords: [
    'Jalgaon jobs',
    'jobs in Jalgaon',
    'Jalgaon job openings',
    'Jalgaon careers',
    'Jalgaon employment',
    'MIDC Jalgaon jobs',
    'Jalgaon IT jobs',
    'Jalgaon teacher jobs',
    'North Maharashtra jobs',
  ],
  openGraph: {
    title: 'Latest Job Openings in Jalgaon — Find Your Career',
    description:
      'Browse 142+ job openings in Jalgaon. Full-time, part-time, contract, and internship opportunities.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Jalgaon.com',
    url: '/jobs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jalgaon Jobs — Find Your Career',
    description: 'Browse 142+ job openings in Jalgaon across IT, manufacturing, education, and more.',
  },
  alternates: {
    canonical: '/jobs',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function JobsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Jalgaon Jobs',
    description: 'Latest job openings and career opportunities in Jalgaon, Maharashtra.',
    url: 'https://jalgaon.com/jobs',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'JobPosting',
            title: 'Senior Full Stack Developer',
            datePosted: '2024-10-22',
            validThrough: '2024-12-31',
            employmentType: 'FULL_TIME',
            hiringOrganization: {
              '@type': 'Organization',
              name: 'TechSol Jalgaon Pvt. Ltd.',
              sameAs: 'https://jalgaon.com',
            },
            jobLocation: {
              '@type': 'Place',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'MIDC Area',
                addressLocality: 'Jalgaon',
                addressRegion: 'Maharashtra',
                postalCode: '425001',
                addressCountry: 'IN',
              },
            },
            baseSalary: {
              '@type': 'MonetaryAmount',
              currency: 'INR',
              value: {
                '@type': 'QuantitativeValue',
                minValue: 800000,
                maxValue: 1200000,
                unitText: 'YEAR',
              },
            },
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'JobPosting',
            title: 'Operations Manager',
            datePosted: '2024-10-19',
            employmentType: 'FULL_TIME',
            hiringOrganization: { '@type': 'Organization', name: 'Mahalakshmi Engineering Works' },
            jobLocation: {
              '@type': 'Place',
              address: { '@type': 'PostalAddress', streetAddress: 'Ajanta Road', addressLocality: 'Jalgaon', addressRegion: 'Maharashtra', addressCountry: 'IN' },
            },
            baseSalary: {
              '@type': 'MonetaryAmount',
              currency: 'INR',
              value: { '@type': 'QuantitativeValue', minValue: 1200000, maxValue: 1800000, unitText: 'YEAR' },
            },
          },
        },
        {
          '@type': 'ListItem',
          position: 3,
          item: {
            '@type': 'JobPosting',
            title: 'PGT Mathematics Teacher',
            datePosted: '2024-10-17',
            employmentType: 'FULL_TIME',
            hiringOrganization: { '@type': 'Organization', name: 'Silver Bells International School' },
            jobLocation: {
              '@type': 'Place',
              address: { '@type': 'PostalAddress', streetAddress: 'Nimbheri', addressLocality: 'Jalgaon', addressRegion: 'Maharashtra', addressCountry: 'IN' },
            },
            baseSalary: {
              '@type': 'MonetaryAmount',
              currency: 'INR',
              value: { '@type': 'QuantitativeValue', minValue: 450000, maxValue: 600000, unitText: 'YEAR' },
            },
          },
        },
        {
          '@type': 'ListItem',
          position: 4,
          item: {
            '@type': 'JobPosting',
            title: 'Relationship Manager - Sales',
            datePosted: '2024-10-21',
            employmentType: 'FULL_TIME',
            hiringOrganization: { '@type': 'Organization', name: 'HDFC Regional Office' },
            jobLocation: {
              '@type': 'Place',
              address: { '@type': 'PostalAddress', streetAddress: 'Court Road', addressLocality: 'Jalgaon', addressRegion: 'Maharashtra', addressCountry: 'IN' },
            },
            baseSalary: {
              '@type': 'MonetaryAmount',
              currency: 'INR',
              value: { '@type': 'QuantitativeValue', minValue: 500000, maxValue: 750000, unitText: 'YEAR' },
            },
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
      <JobsPortal />
    </>
  );
}
