import { Metadata } from 'next';
import AddJobClient from './AddJobClient';

export const metadata: Metadata = {
  title: 'Post a Job | Jalgaon.com',
  description: 'Submit a new job opening on Jalgaon.com.',
};

export default function AddJobPage() {
  return <AddJobClient />;
}
