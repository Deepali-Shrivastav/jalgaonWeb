'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

interface HomeSearchSectionProps {
  onSearch?: (query: string) => void;
  selectedCity?: string;
  onCityChange?: (city: string) => void;
}

const CITIES = [
  'Jalgaon',
  'Bhusawal',
  'Amalner',
  'Chalisgaon',
  'Chopda',
  'Pachora',
  'Jamner',
  'Raver',
  'Yawal',
  'Erandol',
  'Dharangaon',
  'Parola',
  'Muktainagar',
  'Bhadgaon',
  'Bodvad'
];

const ANIMATED_SEARCH_PHRASES = [
  'Jalgaon Glimpses',
  'Automotive',
  'Agri Services',
  'Real Estate & Build'
];

export default function HomeSearchSection({ onSearch, selectedCity: propCity, onCityChange }: HomeSearchSectionProps) {
  const [localCity, setLocalCity] = useState('Jalgaon');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCity = propCity !== undefined ? propCity : localCity;

  const handleCitySelect = (city: string) => {
    if (onCityChange) {
      onCityChange(city);
    } else {
      setLocalCity(city);
    }
    setIsDropdownOpen(false);
  };

  const scrollToCategories = () => {
    const el = document.getElementById('explore-categories') || document.getElementById('explore-industries');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 text-center">
      {/* Centered Rounded Search Box Matching Reference */}
      <div className="mt-3 sm:mt-6 max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-full shadow-md border border-slate-200/90 p-3 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center transition duration-300">
        {/* Location Selector */}
        <div ref={dropdownRef} className="relative flex items-center justify-between px-2 sm:pl-6 sm:pr-3 pb-2.5 sm:pb-0 text-slate-800 font-semibold text-sm sm:text-base border-b sm:border-b-0 sm:border-r border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 cursor-pointer outline-none bg-transparent"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0081c7] text-lg sm:text-xl">location_on</span>
              <span className="tracking-tight font-bold text-slate-900 text-sm sm:text-base">{selectedCity}</span>
            </div>
            <span
              className="material-symbols-outlined text-sm sm:text-xs text-slate-400 transition-transform duration-200"
              style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }}
            >
              expand_more
            </span>
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 right-0 sm:right-auto sm:min-w-[220px] top-[calc(100%+6px)] bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto py-2 text-left animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-1.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 select-none">
                Select Location
              </div>
              {CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-sky-50 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCity.toLowerCase() === city.toLowerCase()
                      ? 'text-[#0081c7] bg-sky-50/80 font-bold'
                      : 'text-slate-700 hover:text-[#0081c7]'
                  }`}
                >
                  <span>{city}</span>
                  {selectedCity.toLowerCase() === city.toLowerCase() && (
                    <span className="material-symbols-outlined text-base text-[#0081c7]">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input Area */}
        <div className="flex-1 flex items-center pt-2.5 sm:pt-0 px-0 sm:px-4 min-w-0">
          <SearchBar
            flat
            placeholder="Search restaurants, services, shops in Jalgaon"
            animatedPlaceholders={ANIMATED_SEARCH_PHRASES}
            onSearch={onSearch}
          />
        </div>
      </div>

      {/* Action Buttons Under Search Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-6 mt-3 sm:mt-7">
        <Link href="/add-listing">
          <span className="rounded-full px-5 sm:px-10 py-2 sm:py-4 bg-[#0081c7] text-white font-bold text-xs sm:text-lg shadow-sm sm:shadow-md hover:bg-[#006ea8] transition duration-300 inline-flex items-center justify-center tracking-tight cursor-pointer">
            List Your Business
          </span>
        </Link>
        <button
          onClick={scrollToCategories}
          type="button"
          className="rounded-full px-5 sm:px-10 py-2 sm:py-4 bg-white text-[#0081c7] font-bold text-xs sm:text-lg border border-slate-200/90 shadow-2xs sm:shadow-sm hover:bg-slate-50 transition duration-300 inline-flex items-center justify-center tracking-tight cursor-pointer"
        >
          Explore Categories
        </button>
      </div>
    </div>
  );
}
