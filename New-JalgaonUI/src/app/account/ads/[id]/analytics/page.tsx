import { Metadata } from 'next';
import AdAnalyticsClient from './AdAnalyticsClient';

export const metadata: Metadata = {
  title: 'Ad Campaign Analytics | Jalgaon.com',
  description: 'View detailed impression and click conversion charts for your active banner and carousel ads.',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <AdAnalyticsClient id={parseInt(resolvedParams.id, 10)} />;
}
