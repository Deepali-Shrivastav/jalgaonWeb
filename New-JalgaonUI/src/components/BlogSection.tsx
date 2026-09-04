"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  category: { id: number; name: string; slug: string } | null;
  author_name: string;
  published_at: string;
  featured_image: string | null;
  readTime?: string;
};

const getImageUrl = (img: any) => {
  if (!img) return 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80';
  let url = img.src || img;
  if (typeof url !== 'string') return 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80';
  if (url.startsWith('https://127.0.0.1:') || url.startsWith('https://localhost:')) {
    url = url.replace('https://', 'http://');
  }
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/v1/blog/featured/`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch blog posts');
        const data = await res.json();
        const results = data.results || data.data || data || [];
        setPosts(results);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="bg-surface-container-low py-section">
        <div className="mx-auto max-w-container-max px-base sm:px-xxl">
          <div className="mb-xxl flex items-end justify-between gap-xl animate-pulse">
            <div>
              <div className="h-4 bg-black/5 rounded w-32 mb-2"></div>
              <div className="h-10 bg-black/5 rounded w-48"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-xl md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-hairline-soft bg-white animate-pulse">
                <div className="aspect-[16/10] bg-black/5"></div>
                <div className="p-xl space-y-3">
                  <div className="h-3 bg-black/5 rounded w-1/4"></div>
                  <div className="h-6 bg-black/5 rounded w-full"></div>
                  <div className="h-4 bg-black/5 rounded w-5/6"></div>
                  <div className="h-4 bg-black/5 rounded w-1/2 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || posts.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="bg-surface-container-low py-8 sm:py-12 md:py-section" aria-labelledby="blog-heading">
      <div className="mx-auto max-w-container-max px-4 sm:px-6 md:px-xxl">
        <div className="mb-xxl flex items-end justify-between gap-xl">
          <div>
            <p className="mb-xs text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Ideas &amp; local stories</p>
            <h2 id="blog-heading" className="text-3xl font-extrabold text-ink-deep md:text-4xl">From the Blog</h2>
          </div>
          <Link href="/blog" className="flex items-center gap-xs text-sm font-bold text-primary hover:underline">
            View all posts <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-xl md:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-xl border border-hairline-soft bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl block">
              <article>
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-low">
                  <img 
                    src={getImageUrl(post.featured_image)} 
                    alt={post.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80';
                    }}
                  />
                </div>
                <div className="p-xl">
                  <div className="flex items-center gap-xs text-[10px] font-extrabold uppercase tracking-widest">
                    <span className="text-primary">{post.category?.name || "Blog"}</span>
                    <span className="h-1 w-1 rounded-full bg-outline-variant" aria-hidden="true" />
                    <span className="text-secondary">{post.readTime || '5 min read'}</span>
                  </div>
                  <h3 className="mt-md text-xl font-extrabold leading-snug text-ink-deep line-clamp-2">{post.title}</h3>
                  <p className="mt-sm leading-relaxed text-secondary line-clamp-2">{post.short_description}</p>
                  <p className="mt-xl flex items-center gap-xs text-sm font-extrabold text-primary">
                    Read article <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
