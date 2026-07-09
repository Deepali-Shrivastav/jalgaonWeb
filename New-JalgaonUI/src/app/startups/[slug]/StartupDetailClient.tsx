'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Founder {
  id: number;
  name: string;
  role: string;
  photo: string | null;
  linkedin: string | null;
  bio: string | null;
}

interface StartupDetail {
  id: number;
  name: string;
  slug: string;
  industry: { id: number, name: string, slug: string } | null;
  logo: string | null;
  description: string;
  founding_year: number | null;
  stage: 'idea' | 'mvp' | 'early_stage' | 'growth' | 'established';
  status: string;
  website: string | null;
  linkedin: string | null;
  twitter: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_featured: boolean;
  is_verified: boolean;
  view_count: number;
  founders: Founder[];
  created_at: string;
}

export default function StartupDetailClient({ slug }: { slug: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const safeSlug = (() => {
    try {
      return encodeURIComponent(decodeURIComponent(slug));
    } catch {
      return encodeURIComponent(slug);
    }
  })();

  const [startup, setStartup] = useState<StartupDetail | null>(null);
  const [relatedStartups, setRelatedStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/v1/startups/${safeSlug}/`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Startup not found');
          throw new Error('Failed to fetch startup details');
        }
        const data: StartupDetail = await res.json();
        setStartup(data);

        // Fetch related startups in same industry
        try {
          if (data.industry) {
            const relRes = await fetch(`${baseUrl}/api/v1/startups/?industry=${data.industry.slug}`);
            if (relRes.ok) {
              const relData = await relRes.json();
              const results = relData.results || relData || [];
              setRelatedStartups(
                results.filter((item: any) => item.id !== data.id).slice(0, 3)
              );
            }
          }
        } catch (e) {
          console.error('Failed to load related startups', e);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [safeSlug, baseUrl]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className="w-full flex flex-col justify-center items-center py-20">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
        <h2 className="text-2xl font-bold text-ink-deep mb-4">{error || 'Startup profile not found'}</h2>
        <Link href="/startups" className="text-primary font-bold hover:underline">
          &larr; Back to Startup Directory
        </Link>
      </div>
    );
  }

  const stageLabels: Record<string, string> = {
    idea: 'Idea Stage',
    mvp: 'MVP',
    early_stage: 'Early Stage',
    growth: 'Growth Stage',
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

  return (
    <div className="w-full bg-surface-container-lowest min-h-screen pb-24 pt-6 md:pt-10 border-t border-hairline-soft">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs md:text-sm font-semibold text-secondary mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link href="/startups" className="hover:text-primary transition-colors">Startups</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          {startup.industry && (
            <>
              <Link href={`/startups?industry=${startup.industry.slug}`} className="hover:text-primary transition-colors">
                {startup.industry.name}
              </Link>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </>
          )}
          <span className="text-ink-deep truncate max-w-[200px] sm:max-w-[300px]">{startup.name}</span>
        </nav>

        {/* Profile Header Block */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-outline-variant shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-surface-container-low rounded-2xl flex items-center justify-center border border-hairline-soft overflow-hidden shrink-0">
                {startup.logo ? (
                  <img 
                    src={startup.logo.startsWith('http') ? startup.logo : `${baseUrl}${startup.logo}`} 
                    alt={startup.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-primary text-5xl">rocket</span>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-ink-deep tracking-tight">{startup.name}</h1>
                  {startup.is_verified && (
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-blue-100" title="Verified Startup">
                      <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span> Verified
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-bold uppercase">
                    {startup.industry?.name || 'General'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-md font-bold ${getStageBadgeClass(startup.stage)}`}>
                    {stageLabels[startup.stage] || startup.stage}
                  </span>
                  {startup.founding_year && (
                    <span className="bg-slate-50 text-secondary border border-outline-variant px-2.5 py-1 rounded-md font-semibold">
                      Established {startup.founding_year}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Views counter */}
            <div className="flex items-center gap-2 text-sm text-secondary font-semibold bg-surface-container-low px-4 py-2 rounded-xl">
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              <span>{startup.view_count} Profile Views</span>
            </div>
          </div>

          {/* Contact & Social Links Bar */}
          <div className="mt-8 pt-6 border-t border-hairline-soft flex flex-wrap gap-3">
            {startup.website && (
              <a
                href={startup.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-deep transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">language</span>
                Website
              </a>
            )}
            {startup.linkedin && (
              <a
                href={startup.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sky-50 text-sky-700 border border-sky-200 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-sky-100 transition-all"
              >
                <span className="material-symbols-outlined text-lg">link</span>
                LinkedIn
              </a>
            )}
            {startup.twitter && (
              <a
                href={startup.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-50 text-slate-800 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-100 transition-all"
              >
                <span className="material-symbols-outlined text-lg">link</span>
                Twitter/X
              </a>
            )}
            {startup.email && (
              <a
                href={`mailto:${startup.email}`}
                className="bg-red-50 text-red-700 border border-red-200 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-100 transition-all"
              >
                <span className="material-symbols-outlined text-lg">mail</span>
                Email
              </a>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }}
              className="ml-auto bg-slate-100 text-slate-700 hover:bg-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-lg">share</span>
              Share Profile
            </button>
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          
          {/* Left Side: About, Founders */}
          <div className="space-y-8">
            
            {/* About / Description */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-outline-variant shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-ink-deep border-b border-hairline-soft pb-3">About the Startup</h2>
              <p className="text-on-surface-variant text-base leading-relaxed whitespace-pre-wrap">
                {startup.description}
              </p>
            </div>

            {/* Founders Section */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-outline-variant shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-ink-deep border-b border-hairline-soft pb-3">Founders & Leadership</h2>
              
              {startup.founders && startup.founders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {startup.founders.map((founder) => (
                    <div key={founder.id} className="bg-surface-container-low rounded-2xl p-5 border border-hairline-soft flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden shrink-0 flex items-center justify-center">
                            {founder.photo ? (
                              <img 
                                src={founder.photo.startsWith('http') ? founder.photo : `${baseUrl}${founder.photo}`} 
                                alt={founder.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-outline text-2xl">person</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-ink-deep text-base leading-snug">{founder.name}</h4>
                            <p className="text-xs text-secondary font-semibold">{founder.role}</p>
                          </div>
                        </div>
                        {founder.bio && (
                          <p className="text-on-surface-variant text-xs leading-relaxed mb-4 line-clamp-4">
                            {founder.bio}
                          </p>
                        )}
                      </div>
                      
                      {founder.linkedin && (
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">link</span>
                          LinkedIn Profile
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary text-sm italic">No founder details listed yet.</p>
              )}
            </div>
          </div>

          {/* Right Side: Contact, Location, Related Startups */}
          <div className="space-y-8">
            
            {/* Contact Details Block */}
            <div className="bg-white rounded-3xl p-6 border border-outline-variant shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-ink-deep border-b border-hairline-soft pb-2">Location & Contact</h3>
              
              <div className="space-y-3.5 text-sm text-on-surface-variant">
                {startup.address && (
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-outline text-[20px] shrink-0 mt-0.5">location_on</span>
                    <span>{startup.address}</span>
                  </div>
                )}
                {startup.phone && (
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-outline text-[20px] shrink-0">call</span>
                    <span>{startup.phone}</span>
                  </div>
                )}
                {startup.email && (
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-outline text-[20px] shrink-0">mail</span>
                    <span>{startup.email}</span>
                  </div>
                )}
                {!startup.address && !startup.phone && !startup.email && (
                  <p className="text-secondary text-xs italic">Contact details are private or unlisted.</p>
                )}
              </div>
            </div>

            {/* Related Startups */}
            {relatedStartups.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-ink-deep">More in {startup.industry?.name}</h3>
                
                <div className="space-y-4">
                  {relatedStartups.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/startups/${rel.slug}`}
                      className="block bg-white rounded-2xl p-4 border border-outline-variant hover:shadow-md transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center border border-hairline-soft overflow-hidden shrink-0">
                          {rel.logo ? (
                            <img
                              src={rel.logo.startsWith('http') ? rel.logo : `${baseUrl}${rel.logo}`}
                              alt={rel.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-primary text-2xl">rocket</span>
                          )}
                        </div>
                        <div className="space-y-1 overflow-hidden">
                          <h4 className="font-bold text-ink-deep text-sm truncate">{rel.name}</h4>
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase inline-block">
                            {stageLabels[rel.stage] || rel.stage}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
