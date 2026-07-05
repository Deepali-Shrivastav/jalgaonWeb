'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

interface NewsDetail {
  id: number;
  title: string;
  slug: string;
  content: string;
  short_description: string;
  featured_image: string | null;
  category: { id: number, name: string, slug: string } | null;
  author_name: string;
  published_at: string;
  view_count: number;
  comments: any[];
}

export default function NewsDetailClient({ slug }: { slug: string }) {
  const [article, setArticle] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/v1/news/${encodeURIComponent(slug)}/`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Article not found');
          throw new Error('Failed to fetch article');
        }
        const data = await res.json();
        setArticle(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="w-full flex flex-col justify-center items-center py-20">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
        <h2 className="text-2xl font-bold text-ink-deep mb-4">{error || 'Article not found'}</h2>
        <Link href="/news" className="text-primary font-bold hover:underline">
          &larr; Back to News
        </Link>
      </div>
    );
  }

  return (
    <article className="w-full bg-white pb-24">
      {/* Immersive Hero */}
      <div className="relative w-full h-[50vh] md:h-[70vh] min-h-[400px] bg-slate-900 overflow-hidden">
        {article.featured_image ? (
          <img
            src={article.featured_image}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:px-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {article.category && (
                <span className="bg-primary text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                  {article.category.name}
                </span>
              )}
              <span className="text-white/90 text-sm flex items-center gap-1.5 font-medium bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                {new Date(article.published_at || new Date()).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
              <span className="text-white/90 text-sm flex items-center gap-1.5 font-medium bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                {article.view_count} views
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-[1.1] drop-shadow-xl tracking-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner">
                {(article.author_name || 'A')[0]}
              </div>
              <div>
                <p className="font-bold text-white text-lg">{article.author_name || 'Editorial Team'}</p>
                <p className="text-sm text-white/60 font-semibold tracking-wide uppercase">Author</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-6 pt-12 md:pt-16">
        <div 
          className="prose prose-lg md:prose-xl prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-3xl prose-img:shadow-xl prose-p:leading-relaxed prose-p:text-slate-700"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content || '') }}
        />
        
        {/* Divider */}
        <div className="my-20 flex items-center justify-center">
           <div className="h-1.5 w-24 bg-primary/20 rounded-full"></div>
        </div>
        
        {/* Comments Section */}
        <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-12 shadow-sm border border-hairline-soft">
          <h3 className="text-3xl font-black text-ink-deep mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">forum</span>
            Discussion ({article.comments?.length || 0})
          </h3>
          
          {article.comments && article.comments.length > 0 ? (
            <div className="space-y-6">
              {article.comments.map((comment: any) => (
                <div key={comment.id} className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/40 flex flex-col sm:flex-row gap-5 transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
                  <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center text-primary font-bold text-xl border border-primary/10">
                    {(comment.user_name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-ink-deep text-lg">{comment.user_name}</span>
                      <span className="text-sm font-semibold text-secondary bg-surface-container-low px-4 py-1.5 rounded-full">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-base md:text-lg leading-relaxed">{comment.body}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-outline-variant/60">
              <span className="material-symbols-outlined text-6xl text-secondary/30 mb-4 block">maps_ugc</span>
              <p className="text-secondary font-semibold text-xl">No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
