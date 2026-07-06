'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Pagination from '@/components/Pagination';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  featured_image: string | null;
  category: { id: number; name: string; slug: string } | null;
  author_name: string;
  published_at: string;
  created_at?: string;
  view_count: number;
}

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

export default function BlogPortal() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/v1/blog/categories/`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to fetch blog categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        let url = `${baseUrl}/api/v1/blog/posts/?page=${page}`;
        if (activeCategory) {
          url += `&category=${encodeURIComponent(activeCategory)}`;
        }
        if (debouncedSearch) {
          url += `&search=${encodeURIComponent(debouncedSearch)}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch blog posts');
        const json = await res.json();
        
        const results = json.results || json.data || json || [];
        setPosts(results);
        
        if (json.count !== undefined) {
          setTotalPages(Math.ceil(json.count / 9)); // 9 posts per page
        } else {
          setTotalPages(1);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [activeCategory, page, debouncedSearch]);

  const handleCategoryClick = (slug: string | null) => {
    setActiveCategory(slug);
    setPage(1);
  };

  return (
    <div className="py-xl">
      <div className="mx-auto max-w-container-max px-base sm:px-xxl">
        {/* Portal Header */}
        <div className="mb-xxl text-center max-w-[640px] mx-auto pt-6">
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Jalgaon.com Journal</span>
          <h1 className="text-4xl font-extrabold text-ink-deep mt-sm mb-base tracking-tight md:text-5xl">
            Local Stories &amp; Insights
          </h1>
          <p className="text-secondary leading-relaxed text-base">
            Explore articles, guides, and stories about Jalgaon's vibrant community, business environment, culture, and travel spots.
          </p>

          {/* Search Input */}
          <div className="mt-xl relative max-w-md mx-auto">
            <span className="material-symbols-outlined absolute left-base top-1/2 -translate-y-1/2 text-secondary text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search articles, tags or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-xxxl pr-xl py-md rounded-full border border-hairline bg-white text-sm text-ink-deep outline-none shadow-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mb-xxl flex flex-wrap items-center justify-center gap-xs">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-lg py-xs rounded-full text-sm font-bold transition-all ${
              activeCategory === null
                ? 'bg-primary text-white shadow-md'
                : 'bg-white border border-hairline-soft text-secondary hover:border-hairline hover:text-ink-deep'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`px-lg py-xs rounded-full text-sm font-bold transition-all capitalize ${
                activeCategory === cat.slug
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white border border-hairline-soft text-secondary hover:border-hairline hover:text-ink-deep'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Loading and Error States */}
        {loading ? (
          <div className="grid grid-cols-1 gap-xl md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : error ? (
          <div className="text-center py-20 bg-surface-container-low border border-hairline-soft rounded-2xl">
            <span className="material-symbols-outlined text-5xl text-red-500 mb-xs">error</span>
            <p className="text-ink-deep font-bold text-lg">Error loading posts</p>
            <p className="text-secondary text-sm mt-xs">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-low border border-hairline-soft rounded-2xl">
            <span className="material-symbols-outlined text-5xl text-secondary mb-xs">article</span>
            <p className="text-ink-deep font-bold text-lg">No posts found</p>
            <p className="text-secondary text-sm mt-xs">Try selecting a different category or refining your search term.</p>
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 gap-xl md:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-xl border border-hairline-soft bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl block"
                >
                  <article>
                    <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-low">
                      <img
                        src={getImageUrl(post.featured_image)}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80';
                        }}
                      />
                    </div>
                    <div className="p-xl">
                      <div className="flex items-center gap-xs text-[10px] font-extrabold uppercase tracking-widest">
                        <span className="text-primary">{post.category?.name || 'Blog'}</span>
                        <span className="h-1 w-1 rounded-full bg-outline-variant" aria-hidden="true" />
                        <span className="text-secondary">
                          {new Date(post.published_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <h3 className="mt-md text-xl font-extrabold leading-snug text-ink-deep line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="mt-sm leading-relaxed text-secondary line-clamp-2">
                        {post.short_description}
                      </p>
                      <div className="mt-xl flex items-center justify-between border-t border-hairline-soft pt-md">
                        <span className="text-xs font-bold text-secondary">By {post.author_name}</span>
                        <span className="flex items-center gap-xs text-sm font-extrabold text-primary">
                          Read <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-20 border-t border-hairline-soft pt-xl">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
