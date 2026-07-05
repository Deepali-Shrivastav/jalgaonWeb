import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface HeroProps {
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

export default function Hero({ onSearch, selectedCity: propCity, onCityChange }: HeroProps) {
  const [localCity, setLocalCity] = useState('Jalgaon');
  const [query, setQuery] = useState('');
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

  const handleSearchClick = () => {
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const scrollToCategories = () => {
    const el = document.getElementById('explore-categories');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Close dropdown on click outside
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
    <section className="hero-gradient pt-section pb-xxxl">
      <div className="max-w-container-max mx-auto px-xxl text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-xl tracking-tight text-ink-deep leading-[1.1]">
          Discover & Grow Local <br /> <span className="text-primary">Businesses in {selectedCity}</span>
        </h1>
        <p className="text-xl md:text-2xl text-secondary max-w-2xl mx-auto mb-xxxl font-light">
          Find services near you or list your business in minutes. The professional gateway to North Maharashtra&apos;s economic heartbeat.
        </p>

        {/* Professional Search Pill */}
        <div className="max-w-3xl mx-auto bg-white rounded-[1.5rem] md:rounded-full p-2 border border-outline-variant flex flex-col md:flex-row items-stretch md:items-center shadow-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all gap-y-1 md:gap-y-0">
          <div ref={dropdownRef} className="relative w-full md:w-auto md:flex-[0.4]">
            <button 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-full flex items-center justify-between md:justify-start px-4 md:px-6 py-3.5 md:py-3 gap-3 border-b md:border-b-0 md:border-r border-hairline-soft cursor-pointer hover:bg-slate-50 transition-colors rounded-t-[1.5rem] md:rounded-l-full outline-none text-left"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">location_on</span>
                <span className="font-bold text-ink-deep whitespace-nowrap text-lg md:text-base">{selectedCity}</span>
              </div>
              <span 
                className="material-symbols-outlined text-slate-400 text-sm transition-transform duration-200 select-none"
                style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }}
              >
                expand_more
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 md:left-4 top-[calc(100%+8px)] bg-white border border-outline-variant rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto py-2 min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-hairline-soft mb-1 select-none">
                  Select Location
                </div>
                {CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleCitySelect(city)}
                    className={`w-full text-left px-5 py-2.5 hover:bg-primary/5 text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCity.toLowerCase() === city.toLowerCase() 
                        ? 'text-primary bg-primary/5 font-bold' 
                        : 'text-slate-700 hover:text-primary'
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity.toLowerCase() === city.toLowerCase() && (
                      <span className="material-symbols-outlined text-base">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="w-full md:w-auto md:flex-1 flex items-center px-4 md:px-6 py-4 md:py-0 gap-3">
            <span className="material-symbols-outlined text-slate-400 text-[22px]">search</span>
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border-none focus:ring-0 font-medium text-on-surface placeholder:text-outline text-left bg-transparent outline-none text-base md:text-base" 
              placeholder={`Search restaurants, services, shops in ${selectedCity}...`} 
              type="text" 
            />
          </div>
          
          <button 
            onClick={handleSearchClick}
            className="w-full md:w-auto bg-primary text-white rounded-xl md:rounded-full p-4 md:p-3 flex items-center justify-center gap-2 hover:bg-primary-deep transition-colors shadow-md mt-1 md:mt-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">search</span>
            <span className="font-bold text-lg md:hidden">Search</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-base mt-xxxl">
          <Link href="/add-listing">
            <button className="bg-primary text-white px-xxxl py-md rounded-full font-bold shadow-xl hover:scale-105 transition-transform cursor-pointer">List Your Business</button>
          </Link>
          <button onClick={scrollToCategories} className="bg-white text-primary border border-primary/20 px-xxxl py-md rounded-full font-bold shadow-lg hover:bg-primary/5 transition-colors cursor-pointer">Explore Categories</button>
        </div>
      </div>
    </section>
  );
}
