import { Metadata } from 'next';
import EditListingClient from './EditListingClient';

export const metadata: Metadata = {
  title: 'Edit Business Listing | Jalgaon.com',
  description: 'Update your business profile on Jalgaon.com',
};

export default async function EditListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <EditListingClient slug={resolvedParams.slug} />;
}
