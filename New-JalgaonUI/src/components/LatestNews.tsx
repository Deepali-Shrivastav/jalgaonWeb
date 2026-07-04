"use client";

import React, { useState, useEffect } from "react";
import Image, { type StaticImageData } from "next/image";

type NewsStory = {
  id?: number;
  title: string;
  summary?: string;
  excerpt?: string;
  category: string;
  date?: string;
  readTime?: string;
  isoDate?: string;
  image?: string | StaticImageData;
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
      <span className={inverse ? "text-white" : "text-primary"}>{category}</span>
      <span aria-hidden="true" className={`h-1 w-1 rounded-full ${inverse ? "bg-white/45" : "bg-outline-variant"}`} />
      <time className={inverse ? "text-white/70" : "text-secondary"} dateTime={isoDate}>
        {date}
      </time>
    </div>
  );
}

export default function LatestNews() {
  const [featuredStory, setFeaturedStory] = useState<NewsStory | null>(null);
  const [newsList, setNewsList] = useState<NewsStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/news/`
          : '/api/v1/news/';
        const res = await fetch(url);
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
  }, []);

  if (loading) {
    return (
      <section className="bg-surface-container-low py-section text-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
        <h3 className="text-lg font-bold text-ink-deep">Loading news...</h3>
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
          <article className="group relative min-h-[500px] overflow-hidden rounded-xl bg-ink-deep shadow-xl lg:min-h-full">
            {featuredStory.image ? (
              <img
                src={typeof featuredStory.image === 'string' ? featuredStory.image : (featuredStory.image as any).src}
                alt={featuredStory.imageAlt || featuredStory.alt || featuredStory.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : null}
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
                {featuredStory.summary || featuredStory.excerpt}
              </p>
            </div>
          </article>

          <div className="grid grid-cols-1 gap-base sm:grid-cols-2 lg:auto-rows-fr">
            {newsList.map((story) => (
              <article
                key={story.id || story.title}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-hairline-soft bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-surface-container-low flex justify-center items-center">
                  {story.image ? (
                    <img
                      src={typeof story.image === 'string' ? story.image : (story.image as any).src}
                      alt={story.imageAlt || story.alt || story.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
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
                  <p className="mt-xs line-clamp-2 text-sm leading-relaxed text-secondary">{story.summary || story.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
