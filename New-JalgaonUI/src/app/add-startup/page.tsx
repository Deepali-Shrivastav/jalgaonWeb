import { Metadata } from 'next';
import AddStartupClient from './AddStartupClient';

export const metadata: Metadata = {
  title: 'Register Your Startup | Jalgaon.com',
  description: 'Submit your startup to the Jalgaon Startup Directory. Showcase your venture, connect with investors, and join the local startup ecosystem.',
};

export default function AddStartupPage() {
  return <AddStartupClient />;
}
