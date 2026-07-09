"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export interface ClubCategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface ClubItem {
  id: number;
  name: string;
  slug: string;
  category: ClubCategoryItem | null;
  logo: string | null;
  short_description: string;
  address: string;
  founded_year: number | null;
  is_featured: boolean;
  is_verified: boolean;
  status: string;
  view_count: number;
  activity_count: number;
  member_count: number;
  created_at: string;
}

export default function ClubsClient() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  
  const [activeFaq, setActiveFaq] = useState<number>(0);
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [categories, setCategories] = useState<ClubCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Fetch Categories & Clubs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, clubRes] = await Promise.all([
          fetch(`${baseUrl}/api/v1/clubs/categories/`),
          fetch(`${baseUrl}/api/v1/clubs/`)
        ]);

        if (!catRes.ok || !clubRes.ok) {
          throw new Error('Failed to fetch clubs data');
        }

        const catData = await catRes.json();
        const clubData = await clubRes.json();

        setCategories(catData.results || catData || []);
        setClubs(clubData.results || clubData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load clubs directory.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Client side filtering for optimal response time
  const filteredClubs = useMemo(() => {
    let result = clubs;
    
    if (selectedCategory !== 'All') {
      result = result.filter(club => club.category?.slug === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (club) =>
          club.name?.toLowerCase().includes(lowerQuery) ||
          club.short_description?.toLowerCase().includes(lowerQuery) ||
          club.category?.name?.toLowerCase().includes(lowerQuery) ||
          club.address?.toLowerCase().includes(lowerQuery)
      );
    }
    return result;
  }, [clubs, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredClubs.length / itemsPerPage);

  const paginatedClubs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClubs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredClubs, currentPage]);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? -1 : index);
  };

  const faqs = [
    {
      question: "How can we register our club on Jalgaon.com?",
      answer: "Registered users can submit their club details by clicking the 'Register Your Club' button. You'll need to log in, provide essential details such as name, category, description, website, contact info, key members, and recent activities. Our moderation team will verify the details before publication."
    },
    {
      question: "What are the requirements for verification checkmarks?",
      answer: "Verified clubs are those with recognized active committees, valid local contact addresses, and operating within the Jalgaon region. Verified profiles feature a blue checkmark badge."
    },
    {
      question: "Is it free to list and manage our club activities?",
      answer: "Yes, listing your club, sharing event details, and listing key members is completely free. Jalgaon.com aims to support social and community groups in organizing activities for the district's residents."
    }
  ];

  return (
    <>
      <Header />
      <main className="flex-1 bg-surface">
        {/* ─── Hero Section ─── */}
        <section
          id="club-hero"
          className="relative w-full min-h-[420px] md:min-h-[500px] flex items-center justify-center overflow-hidden"
          aria-label="Club search"
        >
          <div className="absolute inset-0 hero-gradient" />
          <div className="relative z-10 w-full max-w-4xl px-base flex flex-col items-center text-center gap-8 py-16">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-ink-deep tracking-tight">
                Jalgaon <span className="text-primary">Club & Activity</span> Directory
              </h1>
              <p className="text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Discover sports clubs, theatrical groups, NGOs, environment conservation teams, and hobby circles making Jalgaon active, healthy, and culturally rich.
              </p>
            </div>
            <div className="w-full bg-white p-2 rounded-full shadow-xl flex items-center gap-2 border border-hairline-soft max-w-2xl">
              <div className="flex-1 flex items-center px-4 gap-3">
                <span className="material-symbols-outlined text-outline">
                  search
                </span>
                <input
                  className="w-full border-none focus:ring-0 text-ink-deep bg-transparent py-3 text-base placeholder:text-secondary outline-none"
                  placeholder="Search clubs by name, category, or keyword..."
                  type="search"
                  aria-label="Search Clubs"
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
              <div className="text-3xl font-bold">{clubs.length || '15+'}</div>
              <div className="text-xs opacity-80 uppercase tracking-widest mt-1">Clubs</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{categories.length || '6+'}</div>
              <div className="text-xs opacity-80 uppercase tracking-widest mt-1">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50+</div>
              <div className="text-xs opacity-80 uppercase tracking-widest mt-1">Monthly Events</div>
            </div>
            <div>
              <div className="text-3xl font-bold">2,000+</div>
              <div className="text-xs opacity-80 uppercase tracking-widest mt-1">Active Members</div>
            </div>
          </section>

          {/* Filtering Section */}
          <section className="mb-12 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4 text-ink-deep">Filter by Category</h2>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`whitespace-nowrap px-6 py-2 rounded-full font-semibold transition-colors ${
                    selectedCategory === 'All'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container-low border border-outline-variant hover:border-primary text-on-surface-variant'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`whitespace-nowrap px-6 py-2 rounded-full font-semibold transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-container-low border border-outline-variant hover:border-primary text-on-surface-variant'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="text-sm font-semibold text-secondary">
                Showing {filteredClubs.length} clubs
              </div>
            </div>
          </section>

          {/* Club Listings Grid */}
          <section className="mb-20">
            {loading ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
                <h3 className="text-lg font-bold text-ink-deep">Loading clubs...</h3>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-500">
                <span className="material-symbols-outlined text-4xl mb-4">error</span>
                <h3 className="text-lg font-bold">Failed to load clubs</h3>
              </div>
            ) : filteredClubs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-outline-variant p-8">
                <span className="material-symbols-outlined text-5xl text-outline mb-3">groups</span>
                <h3 className="text-lg font-bold text-ink-deep">No Clubs Found</h3>
                <p className="text-secondary text-sm mt-1">Try resetting your filters or search keywords.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedClubs.map((club) => (
                    <div
                      key={club.id}
                      className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col hover:shadow-lg transition-all duration-300 event-card-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-16 h-16 bg-surface-container-low rounded-xl flex items-center justify-center border border-hairline-soft overflow-hidden shrink-0">
                          {club.logo ? (
                            <img
                              src={club.logo.startsWith('http') ? club.logo : `${baseUrl}${club.logo}`}
                              alt={club.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-primary text-4xl">groups</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 items-end">
                          {club.is_verified && (
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-blue-100">
                              <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span> Verified
                            </span>
                          )}
                          {club.is_featured && (
                            <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-amber-100">
                              <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span> Featured
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-1 text-ink-deep line-clamp-1">{club.name}</h3>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-surface-container-high text-on-surface-variant px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                          {club.category?.name || 'General'}
                        </span>
                      </div>

                      <div className="text-on-surface-variant text-sm line-clamp-3 mb-6 leading-relaxed">
                        {club.founded_year && (
                          <div className="text-xs text-secondary font-semibold mb-2">Est. {club.founded_year}</div>
                        )}
                        <p className="line-clamp-2">{club.short_description}</p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-hairline-soft flex items-center justify-between text-xs text-secondary font-semibold">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">group</span>
                          {club.member_count} Key Contacts
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">event</span>
                          {club.activity_count} Activities
                        </span>
                      </div>

                      <Link
                        href={`/clubs/${club.slug}`}
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
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-ink-deep">Strengthening Community Life in Jalgaon</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-base text-on-surface-variant leading-relaxed">
              <div>
                <p className="mb-4">
                  Clubs and volunteer organizations form the backbone of Jalgaon&apos;s cultural and social structure. From active sports training academies that cultivate district-level players to drama clubs celebrating theatrical traditions in Maharashtra, these groups offer residents platforms to collaborate, learn, and grow.
                </p>
                <p>
                  Our Jalgaon Club Directory provides a comprehensive listing of registered community groups, their regular schedules, activities, and contact members. By cataloging these clubs, we help citizens easily discover weekend workshops, social drives, and hobby classes that match their interests.
                </p>
              </div>
              <div>
                <p className="mb-4">
                  Participating in local activities encourages healthy lifestyles, promotes social integration, and provides valuable volunteer opportunities for youth. Whether you want to participate in a tree-planting drive, test your chess skills, or find a cricket net practice group, this directory will connect you to the right contacts.
                </p>
                <p>
                  Are you a secretary, president, or coordinator of a club operating in Jalgaon, Amalner, Bhusawal, or Chhopda? List your group on our platform to reach more local residents and keep members informed about upcoming camps and events.
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
              <h2 className="text-3xl md:text-4xl font-black">Register Your Club on Jalgaon.com</h2>
              <p className="text-lg opacity-95 max-w-xl mx-auto">
                Promote your weekly workshops, display your core committee, and share photos of recent social drives with the wider city.
              </p>
              <div className="pt-4">
                <Link
                  href="/add-club"
                  className="inline-block bg-white text-primary px-8 py-3.5 rounded-full font-bold tracking-wide hover:bg-slate-50 transition-all shadow-md active:scale-95"
                >
                  Register Your Club
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
