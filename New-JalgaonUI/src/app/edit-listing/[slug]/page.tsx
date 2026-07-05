import { Metadata } from 'next';
import EditListingClient from './EditListingClient';

export const metadata: Metadata = {
  title: 'Edit Business Listing | Jalgaon.com',
  description: 'Update your business profile on Jalgaon.com',
};

export default function EditListingPage({ params }: { params: { slug: string } }) {
  return <EditListingClient slug={params.slug} />;
}
