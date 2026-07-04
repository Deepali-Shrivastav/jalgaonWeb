import { NextResponse } from 'next/server';

export interface Listing {
  id: string;
  name: string;
  category: string;
  displayCategory: string;
  rating: number;
  ratingCount: number;
  featured: boolean;
  verified: boolean;
  address: string;
  distance: number;
  timing: string;
  timingColor: string;
  image: string;
  phone: string;
}

const mockListings: Listing[] = [
  {
    id: '1',
    name: 'City Multi-speciality Hospital',
    category: 'Healthcare',
    displayCategory: 'Multi-speciality Hospital',
    rating: 4.8,
    ratingCount: 12,
    featured: true,
    verified: true,
    address: 'MG Road, Central Jalgaon, MH 425001',
    distance: 1.2,
    timing: 'Open 24 Hours',
    timingColor: 'text-emerald-600',
    image: '/images/hospital.jpg',
    phone: '+912572221234',
  },
  {
    id: '2',
    name: 'Apex Dental & Orthodontic Care',
    category: 'Healthcare',
    displayCategory: 'Dental Clinic',
    rating: 4.2,
    ratingCount: 28,
    featured: false,
    verified: true,
    address: 'Ring Road, Jalgaon, MH 425002',
    distance: 3.5,
    timing: 'Closes at 8:00 PM',
    timingColor: 'text-secondary',
    image: '/images/dental.jpg',
    phone: '+912572235678',
  },
  {
    id: '3',
    name: 'Jalgaon Pharma Hub',
    category: 'Healthcare',
    displayCategory: 'Pharmacy & Wellness',
    rating: 4.5,
    ratingCount: 19,
    featured: false,
    verified: false,
    address: 'Station Road Market, Jalgaon, MH 425001',
    distance: 0.8,
    timing: 'Open Now',
    timingColor: 'text-emerald-600',
    image: '/images/pharmacy.jpg',
    phone: '+912572249012',
  },
  {
    id: '4',
    name: 'Khandesh Auto Care',
    category: 'Automotive',
    displayCategory: 'Multi-service Automotive Centre',
    rating: 4.2,
    ratingCount: 128,
    featured: true,
    verified: true,
    address: 'MIDC, Jalgaon, MH 425003',
    distance: 5.2,
    timing: 'Open until 6:00 PM',
    timingColor: 'text-emerald-600',
    image: '/images/auto-workshop.jpg',
    phone: '+912572221234',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  
  let listings = mockListings;
  
  if (category) {
    // For demo purposes, if category is provided, try to filter. 
    // Since mock list only has Healthcare and Automotive, we will just return a placeholder for other categories if empty,
    // or just return the filtered data.
    listings = listings.filter(item => item.category.toLowerCase() === category.toLowerCase());
    
    // Fallback: If no listings found for category, we'll return a mock entry for that category
    if (listings.length === 0) {
      listings = [
        {
          id: `mock-${category.toLowerCase()}`,
          name: `${category} Premium Service`,
          category: category,
          displayCategory: `${category} Services`,
          rating: 4.0,
          ratingCount: 10,
          featured: true,
          verified: true,
          address: 'Central Area, Jalgaon',
          distance: 2.5,
          timing: 'Open Now',
          timingColor: 'text-emerald-600',
          image: '/images/default-business.jpg', // we can just use a placeholder
          phone: '+910000000000',
        }
      ];
    }
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return NextResponse.json({ data: listings });
}
