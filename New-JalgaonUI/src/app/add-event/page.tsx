import type { Metadata } from 'next';
import AddEventClient from './AddEventClient';

export const metadata: Metadata = {
  title: 'Submit an Event | Jalgaon.com',
  description: 'List your local event on Jalgaon.com to connect with thousands of local residents.',
};

export default function AddEventPage() {
  return <AddEventClient />;
}
