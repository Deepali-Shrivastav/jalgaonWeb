'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MarketWeatherDashboard from '@/components/MarketWeatherDashboard';
import BreakingNews from '@/components/BreakingNews';
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
import BusinessListings from '@/components/BusinessListings';
import BusinessProfile from '@/components/BusinessProfile';

export default function Homepage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<{ id: string; name: string } | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('Jalgaon');

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedListing(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectListing = (id: string, name: string) => {
    setSelectedListing({ id, name });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToListings = () => {
    setSelectedListing(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedCategory(null);
    setSelectedListing(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Header />
      {selectedListing ? (
        <main>
          <BusinessProfile
            listingId={selectedListing.id}
            listingName={selectedListing.name}
            onBack={handleBackToListings}
          />
        </main>
      ) : selectedCategory ? (
        <main>
          <BusinessListings
            category={selectedCategory}
            selectedCity={selectedCity}
            onBack={handleBackToHome}
            onSelectListing={handleSelectListing}
          />
        </main>
      ) : (
        <main>
          <Hero selectedCity={selectedCity} onCityChange={setSelectedCity} />
          <MarketWeatherDashboard />
          <BreakingNews />
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
      )}
      <Footer />
    </>
  );
}
