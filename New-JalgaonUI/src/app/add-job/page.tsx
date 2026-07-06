import { Metadata } from 'next';
import { Suspense } from 'react';
import AddJobClient from './AddJobClient';

export const metadata: Metadata = {
  title: 'Post a Job | Jalgaon.com',
  description: 'Submit a new job opening on Jalgaon.com.',
};

export default function AddJobPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span></div>}>
      <AddJobClient />
    </Suspense>
  );
}
