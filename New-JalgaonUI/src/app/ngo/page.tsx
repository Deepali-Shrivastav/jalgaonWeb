"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import ngoData from './ngo_data.json';

export interface NgoItem {
  id: number;
  name: string;
  category: string;
  location: string;
  link?: string;
  phone?: string | number;
  pincode?: string | number;
  icon?: string;
  verified?: boolean;
}

export default function NgoPage() {
  const [activeFaq, setActiveFaq] = useState<number>(0);
  const [ngos, setNgos] = useState<NgoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    // Make the data static
    setNgos(ngoData as NgoItem[]);
    setLoading(false);
  }, []);

  const filteredNgos = useMemo(() => {
    let result = ngos;
    if (selectedCategory !== 'All') {
      result = result.filter(ngo => ngo.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (ngo) =>
          ngo.name?.toLowerCase().includes(lowerQuery) ||
          ngo.category?.toLowerCase().includes(lowerQuery) ||
          ngo.location?.toLowerCase().includes(lowerQuery)
      );
    }
    return result;
  }, [ngos, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredNgos.length / itemsPerPage);

  const paginatedNgos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNgos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNgos, currentPage]);

  const allCategories = useMemo(() => {
    const cats = new Set(ngos.map(n => n.category || 'Other'));
    return ['All', ...Array.from(cats).sort()];
  }, [ngos]);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? -1 : index);
  };

  const faqs = [
    {
      question: "How to volunteer?",
      answer: "To volunteer, simply browse the NGO listings and click the \"Volunteer\" button on the card of an organization that aligns with your interests. You will be prompted to fill out a short interest form which will be sent directly to the NGO's coordination team."
    },
    {
      question: "How are NGOs verified?",
      answer: "Every organization seeking the 'Verified' badge must submit their valid 12A/80G certificates, registration documents, and recent impact reports. Our team manually reviews these submissions to ensure they are active and compliant with local regulations."
    },
    {
      question: "Is my donation tax-deductible?",
      answer: "Most verified NGOs on our platform are registered under Section 80G of the Income Tax Act, which allows Indian donors to claim a 50% tax deduction on their contributions. Look for the tax-deductible label on the NGO's individual profile page."
    }
  ];

  return (
    <>
      <Header />
      <main className="flex-1 bg-surface">
        {/* ─── Hero Section ─── */}
        <section
          id="ngo-hero"
          className="relative w-full min-h-[420px] md:min-h-[500px] flex items-center justify-center overflow-hidden"
          aria-label="NGO search"
        >
          <div className="absolute inset-0 hero-gradient" />
          <div className="relative z-10 w-full max-w-4xl px-base flex flex-col items-center text-center gap-8 py-16">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-ink-deep tracking-tight">
                Discover & Support <span className="text-primary">NGOs</span> in Jalgaon
              </h1>
              <p className="text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Connect with local non-profits driving real change in healthcare, education, and sustainability across our district.
              </p>
            </div>
            <div className="w-full bg-white p-2 rounded-full shadow-xl flex items-center gap-2 border border-hairline-soft max-w-2xl">
              <div className="flex-1 flex items-center px-4 gap-3">
                <span className="material-symbols-outlined text-outline">
                  search
                </span>
                <input
                  className="w-full border-none focus:ring-0 text-ink-deep bg-transparent py-3 text-base placeholder:text-secondary outline-none"
                  placeholder="Search by name, category, or location..."
                  type="search"
                  aria-label="Search NGOs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="bg-primary text-white px-8 py-3 rounded-full font-bold tracking-wide hover:bg-primary-deep transition-colors active:scale-95">
                Search
              </button>
            </div>
          </div>
        </section>

        {/* ─── Main Content Container ─── */}
        <div className="max-w-container-max mx-auto px-xxl py-12">
          {/* Impact Stats Bar */}
          <section className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-6 bg-primary text-white p-8 rounded-2xl text-center shadow-lg">
            <div>
              <div className="text-3xl font-bold">150+</div>
              <div className="text-xs opacity-80 uppercase tracking-widest mt-1">Registered NGOs</div>
            </div>
            <div>
              <div className="text-3xl font-bold">5,000+</div>
              <div className="text-xs opacity-80 uppercase tracking-widest mt-1">Lives Impacted</div>
            </div>
            <div>
              <div className="text-3xl font-bold">12+</div>
              <div className="text-xs opacity-80 uppercase tracking-widest mt-1">Causes Supported</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-xs opacity-80 uppercase tracking-widest mt-1">Local Support</div>
            </div>
          </section>

          {/* Cause Categories (Filter) */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-ink-deep">Filter by Cause</h2>
            <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar">
              {allCategories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-surface-container-low border border-outline-variant hover:border-primary text-on-surface-variant'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* NGO Listings Grid */}
          <section className="mb-20">
            <div className="">
              {loading ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
                  <h3 className="text-lg font-bold text-ink-deep">Loading NGOs...</h3>
                </div>
              ) : error ? (
                <div className="text-center py-16 text-red-500">
                  <span className="material-symbols-outlined text-4xl mb-4">error</span>
                  <h3 className="text-lg font-bold">Failed to load NGOs</h3>
                </div>
              ) : filteredNgos.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-lg text-secondary">No NGOs found.</h3>
                </div>
              ) : (
                <div className="flex flex-col gap-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginatedNgos.map((ngo) => (
                      <div key={ngo.id || ngo.name} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col hover:shadow-lg transition-shadow event-card-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-16 h-16 bg-surface-container-low rounded-lg flex items-center justify-center border border-hairline-soft overflow-hidden">
                            <span className="material-symbols-outlined text-primary text-4xl">{ngo.icon || 'volunteer_activism'}</span>
                          </div>
                          {ngo.verified !== false && (
                            <span className="bg-surface-container-low text-primary-deep px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-hairline-soft">
                              <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span> Verified
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-ink-deep line-clamp-2" title={ngo.name}>{ngo.name}</h3>
                        <div className="flex gap-2 mb-4">
                          <span className="bg-surface-container-high text-on-surface-variant px-2 py-1 rounded-sm text-[11px] font-bold uppercase">{ngo.category || 'NGO'}</span>
                        </div>
                        <div className="flex flex-col gap-2 text-on-surface-variant text-sm mb-6">
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">location_on</span>
                            <span className="line-clamp-2" title={ngo.location}>{ngo.location || 'Jalgaon'}</span>
                          </div>
                          {ngo.phone && (
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px] shrink-0">call</span>
                              <span>{ngo.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-auto grid grid-cols-2 gap-4">
                          {ngo.link && ngo.link !== 'N/A' ? (
                            <a href={ngo.link} target="_blank" rel="noopener noreferrer" className="border border-primary text-primary py-2.5 rounded-lg font-bold hover:bg-surface-container-high transition-colors text-center flex items-center justify-center">Directions</a>
                          ) : (
                            <button className="border border-primary text-primary py-2.5 rounded-lg font-bold hover:bg-surface-container-high transition-colors">Volunteer</button>
                          )}
                          <button className="bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-primary-deep transition-colors shadow-sm">Donate</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low border border-outline-variant hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                          if (
                            page === 1 || 
                            page === totalPages || 
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-colors ${
                                  currentPage === page 
                                    ? 'bg-primary text-white shadow-sm' 
                                    : 'bg-transparent text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            page === currentPage - 2 || 
                            page === currentPage + 2
                          ) {
                            return <span key={page} className="px-1 text-on-surface-variant">...</span>;
                          }
                          return null;
                        })}
                      </div>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low border border-outline-variant hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* SEO Rich Content Section */}
          <section className="mb-20 bg-surface-container-low rounded-2xl p-8 md:p-12 border border-outline-variant">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-ink-deep">Empowering Jalgaon Through Social Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-base text-on-surface-variant leading-relaxed">
              <div>
                <p className="mb-4">
                  Jalgaon district, often celebrated for its rich agricultural heritage, is also home to a thriving ecosystem of social impact organizations. These NGOs are the backbone of local development, addressing critical issues from educational literacy in rural areas to advanced healthcare accessibility in urban hubs. By providing a centralized directory, <strong>Jalgaon.com</strong> ensures that these organizations receive the visibility and support they need to sustain their vital missions.
                </p>
                <p>
                  Whether it&apos;s promoting women&apos;s empowerment through self-help groups or spearheading large-scale reforestation projects along the Girna river, Jalgaon&apos;s NGOs are driving structural change. Our platform simplifies the process for citizens to find &quot;NGOs near me,&quot; allowing for direct engagement through volunteering opportunities and secure donation channels.
                </p>
              </div>
              <div>
                <p className="mb-4">
                  The social landscape of Jalgaon is evolving rapidly, with technology playing a key role in connecting donors with causes. Every NGO listed on our portal undergoes a verification process to ensure transparency and trust. This professional vetting is essential for fostering a culture of philanthropy and social responsibility among the corporate sector and individual residents alike.
                </p>
                <p>
                  We invite you to explore the diverse categories of service available. From animal welfare shelters to youth vocational training centers, there is a cause for everyone. Your contribution—be it time, skills, or financial support—contributes to a more resilient and equitable Jalgaon. Join us in our mission to catalyze impact across the region.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-ink-deep">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div key={index} className={`border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest transition-all ${isOpen ? 'shadow-md' : ''}`}>
                    <button className="w-full flex items-center justify-between p-6 text-left focus:outline-none hover:bg-surface-container-low transition-colors" onClick={() => toggleFaq(index)}>
                      <span className="font-semibold text-ink-deep">{faq.question}</span>
                      <span className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>
                    <div 
                      className={`px-6 bg-surface-container-lowest transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="text-on-surface-variant text-sm">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Conversion Banner */}
          <section className="mb-10">
            <div className="bg-primary rounded-2xl p-10 md:p-16 text-center text-on-primary relative overflow-hidden shadow-xl">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              <h2 className="text-3xl font-bold mb-6 relative z-10 text-white">Ready to list your NGO?</h2>
              <p className="text-lg mb-10 opacity-90 max-w-2xl mx-auto relative z-10 text-white">
                Join Jalgaon&apos;s largest community directory and connect with hundreds of local donors and volunteers looking to make a difference.
              </p>
              <button className="bg-white text-primary px-10 py-4 rounded-xl font-extrabold text-lg hover:scale-105 transition-transform shadow-xl relative z-10">
                List Your NGO
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
