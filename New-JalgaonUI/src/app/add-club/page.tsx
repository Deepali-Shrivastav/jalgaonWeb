import { Metadata } from 'next';
import AddClubClient from './AddClubClient';

export const metadata: Metadata = {
  title: 'Register Your Club | Jalgaon.com',
  description: 'Submit your community, cultural, social, or sports club to the Jalgaon Club Directory. Gain visibility, announce events, and recruit active members.',
};

export default function AddClubPage() {
  return <AddClubClient />;
}
