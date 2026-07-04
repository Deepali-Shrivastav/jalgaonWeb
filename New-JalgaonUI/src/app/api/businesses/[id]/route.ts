import { NextResponse } from 'next/server';

export interface Review {
  id: string;
  name: string;
  initials: string;
  timeAgo: string;
  rating: number;
  comment: string;
}

export interface BusinessData {
  id: string;
  name: string;
  category: string;
  displayCategory: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  timing: string;
  isOpen: boolean;
  about: string;
  tags: string[];
  phone: string;
  whatsapp: string;
  website?: string;
  heroImage: string;
  gallery: { src: string; alt: string; wide?: boolean; tall?: boolean }[];
  reviews: Review[];
  ratingBreakdown: { stars: number; pct: number }[];
}

const BUSINESS_DATA: Record<string, BusinessData> = {
  default: {
    id: 'default',
    name: 'Khandesh Auto Care',
    category: 'Automotive',
    displayCategory: 'Multi-service Automotive Centre',
    verified: true,
    rating: 4.2,
    reviewCount: 128,
    timing: 'Open until 6:00 PM',
    isOpen: true,
    about:
      'Serving the heart of Jalgaon for over 15 years, Khandesh Auto Care is a premier destination for comprehensive automotive solutions. We specialize in advanced diagnostics, precision wheel alignment, and high-quality engine tuning using state-of-the-art European equipment. Our certified technicians are dedicated to ensuring your vehicle performs at its peak efficiency while maintaining the highest safety standards.',
    tags: ['Car Servicing', 'Wheel Alignment', 'Engine Tuning', 'Body Shop', 'AC Repair', 'Oil Change'],
    phone: '+912572221234',
    whatsapp: '912572221234',
    website: 'https://khandeshautogcare.in',
    heroImage: '/images/auto-workshop.jpg',
    gallery: [
      { src: '/images/auto-engine.jpg', alt: 'Engine tuning by certified mechanic' },
      { src: '/images/auto-alignment.jpg', alt: 'Digital wheel alignment station' },
      { src: '/images/auto-bodyshop.jpg', alt: 'Car body shop paint booth', tall: true },
      { src: '/images/auto-advisor.jpg', alt: 'Service advisor with customer' },
      { src: '/images/auto-workshop.jpg', alt: 'Workshop interior' },
    ],
    ratingBreakdown: [
      { stars: 5, pct: 65 },
      { stars: 4, pct: 20 },
      { stars: 3, pct: 10 },
      { stars: 2, pct: 3 },
      { stars: 1, pct: 2 },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Amit Sharma',
        initials: 'AS',
        timeAgo: '2 days ago',
        rating: 5,
        comment:
          'Excellent service! The wheel alignment was done perfectly and the team was very professional. Highly recommended for anyone in Jalgaon.',
      },
      {
        id: 'r2',
        name: 'Priya Desai',
        initials: 'PD',
        timeAgo: '1 week ago',
        rating: 4,
        comment:
          'Good experience overall. Quick turnaround on the AC repair. Pricing is fair and transparent.',
      },
      {
        id: 'r3',
        name: 'Rohit Patil',
        initials: 'RP',
        timeAgo: '2 weeks ago',
        rating: 4,
        comment:
          'Great workshop. The staff explained every step of the engine diagnosis clearly. Will visit again.',
      },
    ],
  },
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  
  // Use specific data if exists, otherwise return default mock
  const data = BUSINESS_DATA[id] || { ...BUSINESS_DATA.default, id, name: `Business ${id}` };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return NextResponse.json({ data });
}
