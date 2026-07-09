'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ClubActivity {
  id: number;
  title: string;
  description: string;
  activity_date: string;
  activity_type: string;
  photo: string | null;
  is_featured: boolean;
}

interface ClubMember {
  id: number;
  name: string;
  role: string;
  photo: string | null;
  sort_order: number;
}

interface ClubPhoto {
  id: number;
  image: string;
  caption: string | null;
}

interface ClubDetail {
  id: number;
  name: string;
  slug: string;
  category: { id: number, name: string, slug: string } | null;
  logo: string | null;
  banner_image: string | null;
  description: string;
  short_description: string;
  address: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  founded_year: number | null;
  is_featured: boolean;
  is_verified: boolean;
  view_count: number;
  activities: ClubActivity[];
  members: ClubMember[];
  photos: ClubPhoto[];
}

export default function ClubDetailClient({ slug }: { slug: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const safeSlug = (() => {
    try {
      return encodeURIComponent(decodeURIComponent(slug));
    } catch {
      return encodeURIComponent(slug);
    }
  })();

  const [club, setClub] = useState<ClubDetail | null>(null);
  const [relatedClubs, setRelatedClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'about' | 'activities' | 'members' | 'gallery'>('about');

  // Lightbox control
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxCaption, setLightboxCaption] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/v1/clubs/${safeSlug}/`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Club not found');
          throw new Error('Failed to fetch club details');
        }
        const data: ClubDetail = await res.json();
        setClub(data);

        // Fetch related clubs in same category
        try {
          if (data.category) {
            const relRes = await fetch(`${baseUrl}/api/v1/clubs/?category=${data.category.slug}`);
            if (relRes.ok) {
              const relData = await relRes.json();
              const results = relData.results || relData || [];
              setRelatedClubs(
                results.filter((item: any) => item.id !== data.id).slice(0, 3)
              );
            }
          }
        } catch (e) {
          console.error('Failed to load related clubs', e);
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

  if (error || !club) {
    return (
      <div className="w-full flex flex-col justify-center items-center py-20">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
        <h2 className="text-2xl font-bold text-ink-deep mb-4">{error || 'Club profile not found'}</h2>
        <Link href="/clubs" className="text-primary font-bold hover:underline">
          &larr; Back to Club Directory
        </Link>
      </div>
    );
  }

  const activityTypeLabels: Record<string, string> = {
    event: 'Event',
    workshop: 'Workshop',
    camp: 'Camp',
    meeting: 'Meeting',
    competition: 'Competition',
    social_drive: 'Social Drive',
    other: 'Other'
  };

  const getActivityTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'event': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'workshop': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'camp': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'meeting': return 'bg-slate-50 text-slate-700 border border-slate-200';
      case 'competition': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'social_drive': return 'bg-rose-50 text-rose-700 border border-rose-200';
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
          <Link href="/clubs" className="hover:text-primary transition-colors">Clubs</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          {club.category && (
            <>
              <Link href={`/clubs?category=${club.category.slug}`} className="hover:text-primary transition-colors">
                {club.category.name}
              </Link>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </>
          )}
          <span className="text-ink-deep truncate max-w-[200px] sm:max-w-[300px]">{club.name}</span>
        </nav>

        {/* Banner Section */}
        <div className="relative w-full h-[200px] md:h-[300px] rounded-3xl overflow-hidden border border-outline-variant shadow-sm mb-6 bg-gradient-to-r from-sky-400 to-indigo-500">
          {club.banner_image ? (
            <img 
              src={club.banner_image.startsWith('http') ? club.banner_image : `${baseUrl}${club.banner_image}`} 
              alt={`${club.name} Banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <span className="material-symbols-outlined text-[120px] text-white">groups</span>
            </div>
          )}
        </div>

        {/* Profile Header Block */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-outline-variant shadow-sm mb-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-surface-container-low rounded-2xl flex items-center justify-center border border-hairline-soft overflow-hidden shrink-0 shadow-inner">
                {club.logo ? (
                  <img 
                    src={club.logo.startsWith('http') ? club.logo : `${baseUrl}${club.logo}`} 
                    alt={club.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-primary text-5xl">groups</span>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-ink-deep tracking-tight">{club.name}</h1>
                  {club.is_verified && (
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-blue-100" title="Verified Club">
                      <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span> Verified
                    </span>
                  )}
                  {club.is_featured && (
                    <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-amber-100" title="Featured Club">
                      <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span> Featured
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-bold uppercase">
                    {club.category?.name || 'General'}
                  </span>
                  {club.founded_year && (
                    <span className="bg-slate-50 text-secondary border border-outline-variant px-2.5 py-1 rounded-md font-semibold">
                      Established {club.founded_year}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Views counter */}
            <div className="flex items-center gap-2 text-sm text-secondary font-semibold bg-surface-container-low px-4 py-2 rounded-xl">
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              <span>{club.view_count} Profile Views</span>
            </div>
          </div>

          {/* Contact & Social Links Bar */}
          <div className="mt-8 pt-6 border-t border-hairline-soft flex flex-wrap gap-3">
            {club.website && (
              <a
                href={club.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-deep transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">language</span>
                Website
              </a>
            )}
            {club.facebook && (
              <a
                href={club.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#1877F2]/20 transition-all"
              >
                <span className="material-symbols-outlined text-lg">link</span>
                Facebook
              </a>
            )}
            {club.instagram && (
              <a
                href={club.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E4405F]/10 text-[#E4405F] border border-[#E4405F]/20 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#E4405F]/20 transition-all"
              >
                <span className="material-symbols-outlined text-lg">link</span>
                Instagram
              </a>
            )}
            {club.contact_email && (
              <a
                href={`mailto:${club.contact_email}`}
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

        {/* Tab Selection */}
        <div className="border-b border-hairline-soft mb-8 flex gap-8 overflow-x-auto pb-2 scrollbar-none font-bold text-base">
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 transition-all relative ${
              activeTab === 'about' ? 'text-primary' : 'text-secondary hover:text-ink-deep'
            }`}
          >
            About
            {activeTab === 'about' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`pb-3 transition-all relative flex items-center gap-2 ${
              activeTab === 'activities' ? 'text-primary' : 'text-secondary hover:text-ink-deep'
            }`}
          >
            Activities Timeline
            <span className="bg-slate-100 text-secondary px-2 py-0.5 rounded-md text-xs font-semibold">
              {club.activities.length}
            </span>
            {activeTab === 'activities' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 transition-all relative flex items-center gap-2 ${
              activeTab === 'members' ? 'text-primary' : 'text-secondary hover:text-ink-deep'
            }`}
          >
            Key Contacts
            <span className="bg-slate-100 text-secondary px-2 py-0.5 rounded-md text-xs font-semibold">
              {club.members.length}
            </span>
            {activeTab === 'members' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`pb-3 transition-all relative flex items-center gap-2 ${
              activeTab === 'gallery' ? 'text-primary' : 'text-secondary hover:text-ink-deep'
            }`}
          >
            Photo Gallery
            <span className="bg-slate-100 text-secondary px-2 py-0.5 rounded-md text-xs font-semibold">
              {club.photos.length}
            </span>
            {activeTab === 'gallery' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full" />
            )}
          </button>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          
          {/* Left Side: Dynamic Tab Content */}
          <div className="space-y-8">
            
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-outline-variant shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-ink-deep border-b border-hairline-soft pb-3">About the Club</h2>
                <p className="text-on-surface-variant text-base leading-relaxed whitespace-pre-wrap">
                  {club.description}
                </p>
              </div>
            )}

            {/* Activities Timeline Tab */}
            {activeTab === 'activities' && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-outline-variant shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-ink-deep border-b border-hairline-soft pb-3">Club Activities & Events</h2>
                
                {club.activities && club.activities.length > 0 ? (
                  <div className="relative border-l-2 border-slate-100 pl-6 ml-4 space-y-8 py-2">
                    {club.activities.map((act) => (
                      <div key={act.id} className="relative">
                        {/* Dot indicator */}
                        <div className="absolute -left-[33px] top-1.5 w-4.5 h-4.5 rounded-full bg-white border-4 border-primary shadow-sm" />
                        
                        <div className="bg-surface-container-low rounded-2xl p-5 border border-hairline-soft">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <h4 className="font-bold text-ink-deep text-lg leading-snug">{act.title}</h4>
                            <div className="flex gap-2">
                              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${getActivityTypeBadgeClass(act.activity_type)}`}>
                                {activityTypeLabels[act.activity_type] || act.activity_type}
                              </span>
                              {act.is_featured && (
                                <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-xs text-secondary font-bold flex items-center gap-1 mb-4">
                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                            {new Date(act.activity_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                          
                          <p className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap mb-4">
                            {act.description}
                          </p>

                          {act.photo && (
                            <div 
                              className="w-full max-h-[300px] rounded-xl overflow-hidden cursor-pointer shadow-sm border border-outline-variant hover:opacity-95 transition-opacity"
                              onClick={() => {
                                setLightboxImage(act.photo?.startsWith('http') ? act.photo : `${baseUrl}${act.photo}`);
                                setLightboxCaption(act.title);
                              }}
                            >
                              <img 
                                src={act.photo.startsWith('http') ? act.photo : `${baseUrl}${act.photo}`} 
                                alt={act.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">event_busy</span>
                    <p className="text-secondary text-sm italic">No recent activities or events logged yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Key Contacts Tab */}
            {activeTab === 'members' && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-outline-variant shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-ink-deep border-b border-hairline-soft pb-3">Key Contacts & Committee</h2>
                
                {club.members && club.members.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {club.members.map((member) => (
                      <div key={member.id} className="bg-surface-container-low rounded-2xl p-5 border border-hairline-soft flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                          {member.photo ? (
                            <img 
                              src={member.photo.startsWith('http') ? member.photo : `${baseUrl}${member.photo}`} 
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-outline text-3xl">person</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-ink-deep text-base leading-snug">{member.name}</h4>
                          <p className="text-sm text-primary font-bold mt-0.5">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">contacts</span>
                    <p className="text-secondary text-sm italic">No committee members or key contacts added yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Photo Gallery Tab */}
            {activeTab === 'gallery' && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-outline-variant shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-ink-deep border-b border-hairline-soft pb-3">Photo Gallery</h2>
                
                {club.photos && club.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {club.photos.map((photo) => {
                      const fullUrl = photo.image.startsWith('http') ? photo.image : `${baseUrl}${photo.image}`;
                      return (
                        <div 
                          key={photo.id} 
                          className="aspect-square bg-surface-container-low rounded-2xl border border-hairline-soft overflow-hidden cursor-pointer group relative shadow-sm hover:shadow-md transition-all"
                          onClick={() => {
                            setLightboxImage(fullUrl);
                            setLightboxCaption(photo.caption);
                          }}
                        >
                          <img 
                            src={fullUrl} 
                            alt={photo.caption || `Club photo ${photo.id}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {photo.caption && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                              <p className="text-white text-xs font-bold line-clamp-2 leading-relaxed">{photo.caption}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">image_not_supported</span>
                    <p className="text-secondary text-sm italic">No photos uploaded to the gallery yet.</p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Side: Location, Related Clubs */}
          <div className="space-y-8">
            
            {/* Location & Contact */}
            <div className="bg-white rounded-3xl p-6 border border-outline-variant shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-ink-deep border-b border-hairline-soft pb-2">Location & Contacts</h3>
              
              <div className="space-y-3.5 text-sm text-on-surface-variant">
                {club.address && (
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-outline text-[20px] shrink-0 mt-0.5">location_on</span>
                    <span>{club.address}</span>
                  </div>
                )}
                {club.contact_phone && (
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-outline text-[20px] shrink-0">call</span>
                    <span>{club.contact_phone}</span>
                  </div>
                )}
                {club.contact_email && (
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-outline text-[20px] shrink-0">mail</span>
                    <span>{club.contact_email}</span>
                  </div>
                )}
                {!club.address && !club.contact_phone && !club.contact_email && (
                  <p className="text-secondary text-xs italic">Contact details are unlisted.</p>
                )}
              </div>
            </div>

            {/* Related Clubs */}
            {relatedClubs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-ink-deep">More in {club.category?.name}</h3>
                
                <div className="space-y-4">
                  {relatedClubs.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/clubs/${rel.slug}`}
                      className="block bg-white rounded-2xl p-4 border border-outline-variant hover:shadow-md transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center border border-hairline-soft overflow-hidden shrink-0 shadow-inner">
                          {rel.logo ? (
                            <img
                              src={rel.logo.startsWith('http') ? rel.logo : `${baseUrl}${rel.logo}`}
                              alt={rel.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-primary text-2xl">groups</span>
                          )}
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          <h4 className="font-bold text-ink-deep text-sm truncate">{rel.name}</h4>
                          <span className="text-xs text-secondary font-semibold">
                            {rel.activity_count} Activities
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

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 cursor-zoom-out"
          onClick={() => {
            setLightboxImage(null);
            setLightboxCaption(null);
          }}
        >
          <button 
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors flex items-center justify-center"
            onClick={() => {
              setLightboxImage(null);
              setLightboxCaption(null);
            }}
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          
          <div className="max-w-[90vw] max-h-[80vh] relative flex items-center justify-center">
            <img 
              src={lightboxImage} 
              alt={lightboxCaption || 'Gallery Image'} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/10"
            />
          </div>
          
          {lightboxCaption && (
            <p className="text-white font-bold text-sm md:text-base text-center mt-6 max-w-2xl bg-black/40 px-4 py-2 rounded-lg">
              {lightboxCaption}
            </p>
          )}
        </div>
      )}

    </div>
  );
}
