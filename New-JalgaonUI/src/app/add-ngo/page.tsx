import { Metadata } from 'next';
import AddNGOClient from './AddNGOClient';

export const metadata: Metadata = {
  title: 'Register NGO | Jalgaon.com',
  description: 'Register your Non-Governmental Organization on Jalgaon.com to reach more volunteers and donors.',
};

export default function AddNGOPage() {
  return <AddNGOClient />;
}
