import type { Metadata } from 'next';
import ApplicationsClient from './ApplicationsClient';

export const metadata: Metadata = {
  title: 'Manage Job Applications | Jalgaon.com',
  description: 'Manage candidates and applications for your job posting.',
};

export default async function ManageApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ApplicationsClient jobId={resolvedParams.id} />;
}
