"use client";

import React, { useState, useEffect } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

type NewsStory = {
  id?: number;
  title: string;
  summary?: string;
  short_description?: string;
  excerpt?: string;
  category: any;
  date?: string;
  readTime?: string;
  isoDate?: string;
  image?: string | StaticImageData;
  featured_image?: string;
  imageAlt?: string;
  alt?: string;
};


function StoryMeta({
  category,
  date,
  isoDate,
  inverse = false,
}: Pick<NewsStory, "category" | "date" | "isoDate"> & { inverse?: boolean }) {
  return (
    <div className="flex items-center gap-xs text-[11px] font-extrabold uppercase tracking-[0.14em]">
      <span className={inverse ? "text-white" : "text-primary"}>
        {typeof category === 'object' && category !== null ? category.name : (category || 'News')}
      </span>
      <span aria-hidden="true" className={`h-1 w-1 rounded-full ${inverse ? "bg-white/45" : "bg-outline-variant"}`} />
      <time className={inverse ? "text-white/70" : "text-secondary"} dateTime={isoDate}>
        {date}
      </time>
    </div>
  );
}

const getImageUrl = (img: any) => {
  if (!img) return 'https://via.placeholder.com/600x400';
  let url = img.src || img;
  if (typeof url !== 'string') return 'https://via.placeholder.com/600x400';
  if (url.startsWith('https://127.0.0.1:') || url.startsWith('https://localhost:')) {
    url = url.replace('https://', 'http://');
  }
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function LatestNews() {
  const [featuredStory, setFeaturedStory] = useState<NewsStory | null>(null);
  const [newsList, setNewsList] = useState<NewsStory[]>([]);
  const [loading, setLoading] = useState(true);
export default function LatestNews({ initialData }: { initialData?: NewsStory[] }) {
  const [featuredStory, setFeaturedStory] = useState<NewsStory | null>(initialData && initialData.length > 0 ? initialData[0] : null);
  const [newsList, setNewsList] = useState<NewsStory[]>(initialData && initialData.length > 1 ? initialData.slice(1, 5) : []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) return;
    const fetchNews = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const url = `${baseUrl}/api/v1/news/latest/`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        const results = json.results || json.data || json || [];
        
        if (results.length > 0) {
          setFeaturedStory(results[0]);
          setNewsList(results.slice(1, 5)); // display up to 4 other stories
        }
      } catch (err: any) {
        setError(err.message);
        // Fallback to initial if wanted, but here we just show error
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [initialData]);

  if (loading) {
    return (
      <section className="bg-surface-container-low py-section">
        <div className="mx-auto max-w-container-max px-base sm:px-xxl">
          <div className="mb-xl animate-pulse">
            <div className="h-4 bg-black/5 rounded w-32 mb-3"></div>
            <div className="h-10 bg-black/5 rounded w-48"></div>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-xl lg:grid-cols-[1.05fr_1fr]">
            <div className="min-h-[500px] rounded-xl bg-black/5 animate-pulse"></div>
            <div className="grid grid-cols-1 gap-base sm:grid-cols-2 lg:auto-rows-fr">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex h-full flex-col overflow-hidden rounded-xl border border-hairline-soft bg-white animate-pulse">
                  <div className="aspect-[16/9] bg-black/5"></div>
                  <div className="flex flex-1 flex-col p-base sm:p-lg space-y-3">
                    <div className="h-3 bg-black/5 rounded w-1/3 mb-2"></div>
                    <div className="h-5 bg-black/5 rounded w-full"></div>
                    <div className="h-5 bg-black/5 rounded w-5/6"></div>
                    <div className="h-4 bg-black/5 rounded w-3/4 mt-3"></div>
                    <div className="h-4 bg-black/5 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !featuredStory) {
    return (
      <section className="bg-surface-container-low py-section text-center text-red-500">
        <span className="material-symbols-outlined text-4xl mb-4">error</span>
        <h3 className="text-lg font-bold">Failed to load news</h3>
      </section>
    );
  }

  return (
    <section id="latest-news" className="bg-surface-container-low py-section" aria-labelledby="latest-news-heading">
      <div className="mx-auto max-w-container-max px-base sm:px-xxl">
        <div className="mb-xl flex items-end justify-between gap-xl">
          <div>
            <p className="mb-xs text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Stay informed</p>
            <h2 id="latest-news-heading" className="text-3xl font-extrabold text-ink-deep md:text-4xl">
              Latest News
            </h2>
          </div>
          <span className="hidden items-center gap-xs text-sm font-bold text-secondary sm:flex">
            Jalgaon &amp; around
            <span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">location_on</span>
          </span>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-xl lg:grid-cols-[1.05fr_1fr]">
          <Link href={`/news/${(featuredStory as any).slug || featuredStory.id}`} className="group relative min-h-[500px] overflow-hidden rounded-xl bg-ink-deep shadow-xl lg:min-h-full block">
            {(featuredStory.image || featuredStory.featured_image) && (
              <img
                src={getImageUrl(featuredStory.image || featuredStory.featured_image)}
                alt={featuredStory.imageAlt || featuredStory.alt || featuredStory.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/5" />
            <div className="absolute inset-x-0 bottom-0 p-xl sm:p-xxxl">
              <StoryMeta 
                category={featuredStory.category} 
                date={featuredStory.date || featuredStory.readTime || ''} 
                isoDate={featuredStory.isoDate || ''} 
                inverse 
              />
              <h3 className="mt-md max-w-[560px] text-3xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[42px]">
                {featuredStory.title}
              </h3>
              <p className="mt-base max-w-[520px] text-sm leading-relaxed text-white/75 sm:text-base">
                {featuredStory.summary || featuredStory.excerpt || featuredStory.short_description}
              </p>
            </div>
          </Link>

          <div className="grid grid-cols-1 gap-base sm:grid-cols-2 lg:auto-rows-fr">
            {newsList.map((story) => (
              <Link
                key={story.id || story.title}
                href={`/news/${(story as any).slug || story.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-hairline-soft bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl">

                <div className="relative aspect-[16/9] overflow-hidden bg-surface-container-low flex justify-center items-center">
                  {(story.image || story.featured_image) ? (
                    <img
                      src={getImageUrl(story.image || story.featured_image)}
                      alt={story.imageAlt || story.alt || story.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.style.display = 'none';
                        img.parentElement?.querySelector('.img-fallback')?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className="img-fallback material-symbols-outlined text-4xl text-secondary hidden">image</span>
                  {!(story.image || story.featured_image) && (
                    <span className="material-symbols-outlined text-4xl text-secondary">image</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-base sm:p-lg">
                  <StoryMeta 
                    category={story.category} 
                    date={story.date || story.readTime || ''} 
                    isoDate={story.isoDate || ''} 
                  />
                  <h3 className="mt-sm line-clamp-2 text-base font-extrabold leading-snug text-ink-deep sm:text-lg">
                    {story.title}
                  </h3>
                  <p className="mt-xs line-clamp-2 text-sm leading-relaxed text-secondary">
                    {story.summary || story.excerpt || story.short_description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
