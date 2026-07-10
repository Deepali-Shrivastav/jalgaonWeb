import { Metadata } from 'next';
import ListingAnalyticsClient from './ListingAnalyticsClient';

export const metadata: Metadata = {
  title: 'Business Listing Analytics | Jalgaon.com',
  description: 'View detailed traffic and customer interaction data for your business profile.',
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <ListingAnalyticsClient slug={resolvedParams.slug} />;
}
