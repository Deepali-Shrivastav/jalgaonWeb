'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MarketWeatherDashboard from '@/components/MarketWeatherDashboard';
import LatestNews from '@/components/LatestNews';
import UpcomingEvents from '@/components/UpcomingEvents';
import LocalWonders from '@/components/LocalWonders';
import JobOpenings from '@/components/JobOpenings';
import NgoSpotlight from '@/components/NgoSpotlight';
import BlogSection from '@/components/BlogSection';
import TrendingListings from '@/components/TrendingListings';
import IndustryGrids from '@/components/IndustryGrids';
import CallToAction from '@/components/CallToAction';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

export default function Home() {
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
      <Header />
      <main>
          <MarketWeatherDashboard />
          <Hero selectedCity={selectedCity} onCityChange={setSelectedCity} onSearch={handleSearch} />
          <TrendingListings selectedCity={selectedCity} />
          <IndustryGrids onSelectCategory={handleSelectCategory} />
          <LatestNews />
          <UpcomingEvents />
          <LocalWonders />
          <JobOpenings />
          <NgoSpotlight />
          <BlogSection />
          <CallToAction />
          <ContactForm />
      </main>
      <Footer />
    </>
  );
}
