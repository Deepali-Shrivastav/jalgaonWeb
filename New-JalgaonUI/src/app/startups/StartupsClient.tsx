"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export interface StartupItem {
  id: number;
  name: string;
  slug: string;
  industry: {
    id: number;
    name: string;
    slug: string;
  } | null;
  logo: string | null;
  founding_year: number | null;
  stage: 'idea' | 'mvp' | 'early_stage' | 'growth' | 'established';
  status: string;
  website: string | null;
  linkedin: string | null;
  twitter: string | null;
  is_featured: boolean;
  is_verified: boolean;
  view_count: number;
  founder_count: number;
  created_at: string;
}

export interface IndustryItem {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export default function StartupsClient() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  
  const [activeFaq, setActiveFaq] = useState<number>(0);
  const [startups, setStartups] = useState<StartupItem[]>([]);
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Fetch Industries & Startups
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [indRes, startupRes] = await Promise.all([
          fetch(`${baseUrl}/api/v1/startups/industries/`),
          fetch(`${baseUrl}/api/v1/startups/`)
        ]);

        if (!indRes.ok || !startupRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const indData = await indRes.json();
        const startupData = await startupRes.json();

        setIndustries(indData.results || indData || []);
        setStartups(startupData.results || startupData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load startups data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedIndustry, selectedStage]);

  // Client side filtering for maximum responsiveness
  const filteredStartups = useMemo(() => {
    let result = startups;
    
    if (selectedIndustry !== 'All') {
      result = result.filter(startup => startup.industry?.slug === selectedIndustry);
    }
    
    if (selectedStage !== 'All') {
      result = result.filter(startup => startup.stage === selectedStage);
    }
    
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (startup) =>
          startup.name?.toLowerCase().includes(lowerQuery) ||
          startup.industry?.name?.toLowerCase().includes(lowerQuery) ||
          startup.stage?.toLowerCase().includes(lowerQuery)
      );
    }
    return result;
  }, [startups, searchQuery, selectedIndustry, selectedStage]);

  const totalPages = Math.ceil(filteredStartups.length / itemsPerPage);

  const paginatedStartups = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStartups.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStartups, currentPage]);

  const stageLabels: Record<string, string> = {
    idea: 'Idea',
    mvp: 'MVP',
    early_stage: 'Early Stage',
    growth: 'Growth',
    established: 'Established',
  };

  const getStageBadgeClass = (stage: string) => {
    switch (stage) {
      case 'idea': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'mvp': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'early_stage': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'growth': return 'bg-green-50 text-green-700 border border-green-200';
      case 'established': return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? -1 : index);
  };

  const faqs = [
    {
      question: "How can I register my startup on Jalgaon.com?",
      answer: "Registered users can submit their startups by clicking the 'Register Your Startup' button. You need to log in, provide essential details such as name, industry, funding stage, description, website, and info about the founders. Our moderation team will verify the details before approving them."
    },
    {
      question: "What is the criteria for a verified startup?",
      answer: "Verified startups are those with registered legal entities (LLP, Private Limited, or Proprietorship) having active operations, valid contact information, and operating within the Jalgaon region. Verified profiles feature a blue checkmark badge."
    },
    {
      question: "Are there any listing or promotion fees?",
      answer: "No, submitting your startup and listing it in the startup directory on Jalgaon.com is completely free. We aim to empower local founders and facilitate community growth."
    }
  ];

  return (
    <>
      <Header />
      <main className="flex-1 bg-surface">
        {/* ─── Hero Section ─── */}
        <section
          id="startup-hero"
          className="relative w-full min-h-[420px] md:min-h-[500px] flex items-center justify-center overflow-hidden"
          aria-label="Startup search"
        >
          <div className="absolute inset-0 hero-gradient" />
          <div className="relative z-10 w-full max-w-4xl px-base flex flex-col items-center text-center gap-8 py-16">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-ink-deep tracking-tight">
                Jalgaon <span className="text-primary">Startup</span> Ecosystem
              </h1>
              <p className="text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Discover innovative startups, connect with local founders, and explore investment stages building the commercial future of Jalgaon.
              </p>
            </div>
            <div className="w-full bg-white p-2 rounded-full shadow-xl flex items-center gap-2 border border-hairline-soft max-w-2xl">
              <div className="flex-1 flex items-center px-4 gap-3">
                <span className="material-symbols-outlined text-outline">
                  search
                </span>
                <input
                  className="w-full border-none focus:ring-0 text-ink-deep bg-transparent py-3 text-base placeholder:text-secondary outline-none"
                  placeholder="Search startups by name, industry, or stage..."
                  type="search"
                  aria-label="Search Startups"
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
          {/* Ecosystem Stats Bar */}
          <section className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-6 bg-primary text-white p-8 rounded-2xl text-center shadow-lg">
            <div>
              <div className="text-3xl font-bold">{startups.length || '30+'}</div>
              <div className="text-xs opacity-80 uppercase tracking-widest mt-1">Startups</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{industries.length || '8+'}</div>
              <div className="text-xs opacity-80 uppercase tracking-widest mt-1">Industries</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100+</div>
              <div className="text-xs opacity-80 uppercase tracking-widest mt-1">Founders & Team</div>
            </div>
            <div>
              <div className="text-3xl font-bold">₹5Cr+</div>
              <div className="text-xs opacity-80 uppercase tracking-widest mt-1">Estimated Valuation</div>
            </div>
          </section>

          {/* Filtering Section */}
          <section className="mb-12 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4 text-ink-deep">Filter by Industry</h2>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
                <button
                  onClick={() => setSelectedIndustry('All')}
                  className={`whitespace-nowrap px-6 py-2 rounded-full font-semibold transition-colors ${
                    selectedIndustry === 'All'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container-low border border-outline-variant hover:border-primary text-on-surface-variant'
                  }`}
                >
                  All Industries
                </button>
                {industries.map(ind => (
                  <button
                    key={ind.id}
                    onClick={() => setSelectedIndustry(ind.slug)}
                    className={`whitespace-nowrap px-6 py-2 rounded-full font-semibold transition-colors ${
                      selectedIndustry === ind.slug
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-container-low border border-outline-variant hover:border-primary text-on-surface-variant'
                    }`}
                  >
                    {ind.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-secondary">Funding Stage:</span>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="bg-white border border-outline-variant rounded-xl px-4 py-2 text-sm text-ink-deep font-semibold outline-none focus:border-primary"
                >
                  <option value="All">All Stages</option>
                  <option value="idea">Idea</option>
                  <option value="mvp">MVP</option>
                  <option value="early_stage">Early Stage</option>
                  <option value="growth">Growth</option>
                  <option value="established">Established</option>
                </select>
              </div>
              
              <div className="text-sm font-semibold text-secondary">
                Showing {filteredStartups.length} startups
              </div>
            </div>
          </section>

          {/* Startup Listings Grid */}
          <section className="mb-20">
            {loading ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
                <h3 className="text-lg font-bold text-ink-deep">Loading startups...</h3>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-500">
                <span className="material-symbols-outlined text-4xl mb-4">error</span>
                <h3 className="text-lg font-bold">Failed to load startups</h3>
              </div>
            ) : filteredStartups.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-outline-variant p-8">
                <span className="material-symbols-outlined text-5xl text-outline mb-3">rocket</span>
                <h3 className="text-lg font-bold text-ink-deep">No Startups Found</h3>
                <p className="text-secondary text-sm mt-1">Try resetting your filters or search keywords.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedStartups.map((startup) => (
                    <div
                      key={startup.id}
                      className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col hover:shadow-lg transition-all duration-300 event-card-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-16 h-16 bg-surface-container-low rounded-xl flex items-center justify-center border border-hairline-soft overflow-hidden shrink-0">
                          {startup.logo ? (
                            <img
                              src={startup.logo.startsWith('http') ? startup.logo : `${baseUrl}${startup.logo}`}
                              alt={startup.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-primary text-4xl">rocket</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 items-end">
                          {startup.is_verified && (
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-blue-100">
                              <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span> Verified
                            </span>
                          )}
                          {startup.is_featured && (
                            <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-amber-100">
                              <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span> Featured
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-1 text-ink-deep line-clamp-1">{startup.name}</h3>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-surface-container-high text-on-surface-variant px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                          {startup.industry?.name || 'General'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStageBadgeClass(startup.stage)}`}>
                          {stageLabels[startup.stage] || startup.stage}
                        </span>
                      </div>

                      <div className="text-on-surface-variant text-sm line-clamp-3 mb-6 leading-relaxed">
                        {startup.founding_year && (
                          <div className="text-xs text-secondary font-semibold mb-2">Est. {startup.founding_year}</div>
                        )}
                        <p className="line-clamp-2">Click to learn more about this innovative startup operating in the region.</p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-hairline-soft flex items-center justify-between text-xs text-secondary font-semibold">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">group</span>
                          {startup.founder_count} {startup.founder_count === 1 ? 'Founder' : 'Founders'}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          {startup.view_count} views
                        </span>
                      </div>

                      <Link
                        href={`/startups/${startup.slug}`}
                        className="mt-4 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-deep transition-colors text-center shadow-sm block text-sm"
                      >
                        View Profile
                      </Link>
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
          </section>

          {/* SEO Rich Content Section */}
          <section className="mb-20 bg-surface-container-low rounded-2xl p-8 md:p-12 border border-outline-variant">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-ink-deep">Accelerating Innovation in Jalgaon District</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-base text-on-surface-variant leading-relaxed">
              <div>
                <p className="mb-4">
                  Jalgaon, historically recognized as the &quot;Banana Capital of India&quot; and a hub for agriculture and gold markets, is witnessing a massive transition towards modern technology and digital entrepreneurship. From smart AgriTech solutions optimizing farm yields to innovative EdTech and FinTech services catering to regional growth, Jalgaon&apos;s startups are redesigning the economic landscape.
                </p>
                <p>
                  Our Jalgaon Startup Directory is designed to bridge the gap between regional innovators, national investors, and potential partners. By curating a verified list of active ventures, we aim to build a strong community database that showcases the breadth and depth of Jalgaon&apos;s entrepreneurial potential.
                </p>
              </div>
              <div>
                <p className="mb-4">
                  Whether you are looking for early-stage investment opportunities, seeking collaboration with tech founders, or looking to support local innovators, this directory serves as the perfect platform. We highlight startup stages from pure ideation to growth and established phases, offering a transparent roadmap of how businesses scale inside our district.
                </p>
                <p>
                  Are you a founder based in Jalgaon, Pachora, Bhusawal, or other parts of the district? Make sure your business is listed. Registering your startup offers visibility, builds authority, and showcases your innovations to the wider business community.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-ink-deep">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border border-outline-variant rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-ink-deep hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className="material-symbols-outlined text-secondary transition-transform duration-200" style={{ transform: activeFaq === index ? 'rotate(180deg)' : 'none' }}>
                      expand_more
                    </span>
                  </button>
                  {activeFaq === index && (
                    <div className="px-6 pb-6 pt-2 text-on-surface-variant text-sm border-t border-hairline-soft leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* CTA Banner Section */}
          <section className="bg-primary text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-black">Building a Startup in Jalgaon?</h2>
              <p className="text-lg opacity-95 max-w-xl mx-auto">
                Get listed on Jalgaon.com for free, connect with volunteers, and showcase your enterprise to potential local investors and clients.
              </p>
              <div className="pt-4">
                <Link
                  href="/add-startup"
                  className="inline-block bg-white text-primary px-8 py-3.5 rounded-full font-bold tracking-wide hover:bg-slate-50 transition-all shadow-md active:scale-95"
                >
                  Register Your Startup
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
