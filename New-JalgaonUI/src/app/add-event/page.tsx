import { Metadata } from 'next';
import AddEventClient from './AddEventClient';

export const metadata: Metadata = {
  title: 'Submit an Event | Jalgaon.com',
  description: 'Host and promote your local events in Jalgaon.',
};

export default function AddEventPage() {
  return <AddEventClient />;
}
