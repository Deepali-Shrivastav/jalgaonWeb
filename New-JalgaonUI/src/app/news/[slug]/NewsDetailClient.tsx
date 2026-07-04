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
    <article className="bg-white rounded-2xl shadow-sm border border-hairline-soft overflow-hidden">
      {article.featured_image && (
        <div className="w-full h-[400px] overflow-hidden">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          {article.category && (
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              {article.category.name}
            </span>
          )}
          <span className="text-secondary text-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            {new Date(article.published_at || new Date()).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <span className="text-secondary text-sm flex items-center gap-1 ml-4">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            {article.view_count} views
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-ink-deep mb-6 leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center gap-3 mb-10 pb-10 border-b border-hairline-soft">
          <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center text-primary font-bold text-lg">
            {(article.author_name || 'A')[0]}
          </div>
          <div>
            <p className="font-bold text-ink-deep">{article.author_name || 'Admin'}</p>
            <p className="text-sm text-secondary">Author</p>
          </div>
        </div>

        <div 
          className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content || '') }}
        />
        
        {/* Comments Section placeholder */}
        <div className="mt-16 pt-10 border-t border-hairline-soft">
          <h3 className="text-2xl font-bold text-ink-deep mb-6">
            Comments ({article.comments?.length || 0})
          </h3>
          {article.comments && article.comments.length > 0 ? (
            <div className="space-y-6">
              {article.comments.map((comment: any) => (
                <div key={comment.id} className="bg-surface-container-lowest p-6 rounded-xl border border-hairline-soft">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-ink-deep">{comment.user_name}</span>
                    <span className="text-sm text-secondary">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-ink-deep leading-relaxed">{comment.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary italic">No comments yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </div>
    </article>
  );
}
