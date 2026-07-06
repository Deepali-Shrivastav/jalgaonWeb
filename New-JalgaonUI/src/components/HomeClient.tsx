"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/Hero';
import MarketWeatherDashboard from '@/components/MarketWeatherDashboard';
import LatestNews from '@/components/LatestNews';
import UpcomingEvents from '@/components/UpcomingEvents';
import LocalWonders from '@/components/LocalWonders';
import JobOpenings from '@/components/JobOpenings';
import NgoSpotlight from '@/components/NgoSpotlight';
import TrendingListings from '@/components/TrendingListings';
import IndustryGrids from '@/components/IndustryGrids';
import CallToAction from '@/components/CallToAction';
import ContactForm from '@/components/ContactForm';

export default function HomeClient({ 
  trendingListings, 
  news, 
  events, 
  jobs 
}: { 
  trendingListings?: any[], 
  news?: any[], 
  events?: any[], 
  jobs?: any[] 
}) {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState<string>('Jalgaon');

  const handleSelectCategory = (cat: string) => {
    router.push(`/category/${cat}`);
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <MarketWeatherDashboard />
      <Hero selectedCity={selectedCity} onCityChange={setSelectedCity} onSearch={handleSearch} />
      <TrendingListings selectedCity={selectedCity} initialData={trendingListings} />
      <IndustryGrids onSelectCategory={handleSelectCategory} />
      <LatestNews initialData={news} />
      <UpcomingEvents initialData={events} />
      <LocalWonders />
      <JobOpenings initialData={jobs} />
      <NgoSpotlight />
      {/* <BlogSection /> */}
      <CallToAction />
      <ContactForm />
    </>
  );
}
