import type { Metadata } from 'next';
import NgoClient from './NgoClient';

export const metadata: Metadata = {
  title: 'Jalgaon NGOs | Volunteer, Donate & Support Local Charities',
  description: 'Connect with local non-profits driving real change in healthcare, education, and sustainability across Jalgaon district. Find verified NGOs, volunteer, or donate.',
  keywords: [
    'Jalgaon NGO',
    'volunteer in Jalgaon',
    'donate Jalgaon',
    'charities in Jalgaon',
    'Jalgaon social work',
    'Jalgaon community service',
  ],
  openGraph: {
    title: 'Jalgaon NGOs | Support Local Charities',
    description: 'Connect with local non-profits driving real change across Jalgaon district.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Jalgaon.com',
    url: '/ngo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jalgaon NGOs | Support Local Charities',
    description: 'Connect with local non-profits driving real change across Jalgaon district.',
  },
  alternates: {
    canonical: '/ngo',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function NgoPage() {
  const [activeFaq, setActiveFaq] = useState<number>(0);
  const [ngos, setNgos] = useState<NgoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNgos = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ngo/`
          : '/api/v1/ngo/';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch NGOs');
        const json = await res.json();
        const rawNgos = json.results || json.data || json || [];
        const mappedNgos = rawNgos.map((ngo: any) => ({
          id: ngo.id,
          name: ngo.name,
          category: ngo.category?.name || 'General',
          location: ngo.address || 'Jalgaon, India',
          icon: ngo.logo || undefined,
          verified: ngo.is_verified,
        }));
        setNgos(mappedNgos);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Jalgaon NGOs",
    "description": "Directory of verified Non-Governmental Organizations in Jalgaon.",
    "url": "https://jalgaon.com/ngo",
    "publisher": {
      "@type": "Organization",
      "name": "Jalgaon.com",
      "url": "https://jalgaon.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://jalgaon.com/icon.png"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NgoClient />
    </>
  );
}
