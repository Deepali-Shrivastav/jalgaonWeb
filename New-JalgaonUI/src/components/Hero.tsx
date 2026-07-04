import React from 'react';

export default function Hero() {
  return (
    <section className="hero-gradient pt-section pb-xxxl">
      <div className="max-w-container-max mx-auto px-xxl text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-xl tracking-tight text-ink-deep leading-[1.1]">
          Discover & Grow Local <br /> <span className="text-primary">Businesses in Jalgaon</span>
        </h1>
        <p className="text-xl md:text-2xl text-secondary max-w-2xl mx-auto mb-xxxl font-light">
          Find services near you or list your business in minutes. The professional gateway to North Maharashtra&apos;s economic heartbeat.
        </p>

        {/* Professional Search Pill */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl md:rounded-full p-xxs md:p-1 border border-outline-variant flex flex-col md:flex-row items-stretch md:items-center shadow-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all gap-y-2 md:gap-y-0">
          <div className="w-full md:w-auto md:flex-[0.4] flex items-center justify-between md:justify-start px-xl py-3 md:py-0 gap-md border-b md:border-b-0 md:border-r border-hairline-soft">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <span className="font-bold text-ink-deep whitespace-nowrap">Jalgaon</span>
            </div>
            <span className="material-symbols-outlined text-slate-500 text-sm">expand_more</span>
          </div>
          
          <div className="w-full md:w-auto md:flex-1 flex items-center px-xl py-2 md:py-0 gap-md">
            <span className="material-symbols-outlined text-slate-500 hidden md:block">search</span>
            <input 
              className="w-full border-none focus:ring-0 font-medium text-on-surface placeholder:text-outline text-center md:text-left bg-transparent outline-none" 
              placeholder="Search restaurants, services, shops..." 
              type="text" 
            />
          </div>
          
          <button className="w-full md:w-auto bg-primary text-white rounded-2xl md:rounded-full p-3 md:p-md flex items-center justify-center hover:bg-primary-deep transition-colors shadow-lg mt-1 md:mt-0 mx-2 md:mx-0 mb-2 md:mb-0">
            <span className="material-symbols-outlined hidden md:block">search</span>
            <span className="md:hidden font-bold">Search</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-base mt-xxxl">
          <button className="bg-primary text-white px-xxxl py-md rounded-full font-bold shadow-xl hover:scale-105 transition-transform">List Your Business</button>
          <button className="bg-white text-primary border border-primary/20 px-xxxl py-md rounded-full font-bold shadow-lg hover:bg-primary/5 transition-colors">Explore Categories</button>
        </div>
      </div>
    </section>
  );
}
