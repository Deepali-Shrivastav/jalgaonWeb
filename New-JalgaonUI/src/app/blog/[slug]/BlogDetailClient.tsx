'use client';

import React, { useState, useEffect, useContext, useRef } from 'react';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import { AuthContext } from '@/context/AuthContext';

interface BlogDetail {
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

interface TocItem {
  id: string;
  text: string;
  level: number;
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

export default function BlogDetailClient({ slug }: { slug: string }) {
  const { isLogin, setIsLoginFormOpen } = useContext(AuthContext);
  const [post, setPost] = useState<BlogDetail | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentMsg, setCommentMsg] = useState("");
  const [toc, setToc] = useState<TocItem[]>([]);
  const [processedContent, setProcessedContent] = useState("");
  const [activeHeadingId, setActiveHeadingId] = useState("");

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    setCommentMsg("");
    
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const res = await fetch(`${baseUrl}/api/v1/blog/${encodeURIComponent(slug)}/comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ body: commentText })
      });
      
      if (res.ok) {
        setCommentMsg("Comment submitted successfully!");
        setCommentText("");
        // Reload comments
        const freshRes = await fetch(`${baseUrl}/api/v1/blog/${encodeURIComponent(slug)}/`);
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          setPost(freshData);
        }
      } else {
        setCommentMsg("Failed to submit comment.");
      }
    } catch (err) {
      setCommentMsg("An error occurred while submitting.");
    } finally {
      setSubmittingComment(false);
      setTimeout(() => setCommentMsg(""), 5000);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        const res = await fetch(`${baseUrl}/api/v1/blog/${encodeURIComponent(slug)}/`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Blog post not found');
          throw new Error('Failed to fetch blog post');
        }
        const data: BlogDetail = await res.json();
        
        // Auto-generate TOC by parsing headings from data.content
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.content, 'text/html');
        const headings = doc.querySelectorAll('h2, h3, h4');
        const tocItems: TocItem[] = [];
        
        headings.forEach((heading, idx) => {
          const id = heading.id || `heading-${idx}`;
          heading.setAttribute('id', id);
          tocItems.push({
            id,
            text: heading.textContent || '',
            level: parseInt(heading.tagName.substring(1))
          });
        });

        setToc(tocItems);
        setProcessedContent(doc.body.innerHTML);
        setPost(data);

        // Fetch related posts from same category
        try {
          let relatedUrl = `${baseUrl}/api/v1/blog/posts/?page=1`;
          if (data.category) {
            relatedUrl += `&category=${encodeURIComponent(data.category.slug)}`;
          }
          const relRes = await fetch(relatedUrl);
          if (relRes.ok) {
            const relData = await relRes.json();
            const results = relData.results || relData.data || relData || [];
            setRelatedPosts(results.filter((item: any) => item.id !== data.id).slice(0, 3));
          }
        } catch (e) {
          console.error("Failed to fetch related posts", e);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // Set up intersection observer for dynamic active TOC highlight
  useEffect(() => {
    if (toc.length === 0) return;
    const observers: IntersectionObserver[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [toc, processedContent]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full flex flex-col justify-center items-center py-20">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
        <h2 className="text-2xl font-bold text-ink-deep mb-4">{error || 'Post not found'}</h2>
        <Link href="/blog" className="text-primary font-bold hover:underline">
          &larr; Back to Blog
        </Link>
      </div>
    );
  }

  const cleanContentHtml = DOMPurify.sanitize(processedContent || post.content);

  return (
    <article className="w-full bg-surface-container-lowest min-h-screen pb-24 pt-6 md:pt-10 border-t border-hairline-soft">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs md:text-sm font-semibold text-secondary mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          {post.category && (
            <>
              <Link href={`/blog?category=${post.category.slug}`} className="hover:text-primary transition-colors">
                {post.category.name}
              </Link>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </>
          )}
          <span className="text-ink-deep truncate max-w-[200px] sm:max-w-[300px]">{post.title}</span>
        </nav>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-ink-deep mb-6 leading-[1.15] tracking-tight">
          {post.title}
        </h1>

        {/* Hero Image */}
        <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden bg-surface-container-low mb-8 relative border border-hairline-soft">
          <img 
            src={getImageUrl(post.featured_image)} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Main Grid: Content + TOC Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-12 xl:gap-16 items-start">
          
          {/* Left Side: Content, Comments */}
          <div className="w-full">
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary pb-4 border-b border-hairline-soft mb-8">
              <span>By <strong className="text-ink-deep">{post.author_name}</strong></span>
              <span>•</span>
              <span>{new Date(post.published_at || new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span>•</span>
              <span className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-base">visibility</span>
                {post.view_count} views
              </span>
            </div>

            {/* Article Body */}
            <div 
              className="prose max-w-none text-ink-deep leading-relaxed text-base space-y-6"
              dangerouslySetInnerHTML={{ __html: cleanContentHtml }}
            />

            {/* Social Share */}
            <div className="mt-12 py-6 border-y border-hairline-soft flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-extrabold uppercase tracking-wider text-secondary">Share this article</span>
              <div className="flex items-center gap-sm">
                <button 
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`, '_blank')}
                  className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                  title="Share on WhatsApp"
                >
                  <span className="material-symbols-outlined">share</span>
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }}
                  className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  title="Copy Link"
                >
                  <span className="material-symbols-outlined">content_copy</span>
                </button>
              </div>
            </div>

            {/* Comment Section */}
            <div className="mt-16">
              <h3 className="text-2xl font-extrabold text-ink-deep mb-8 flex items-center gap-xs">
                Comments 
                <span className="px-sm py-0.5 rounded-full bg-primary/10 text-primary text-sm font-bold">
                  {post.comments?.length || 0}
                </span>
              </h3>

              {isLogin ? (
                <form onSubmit={handleCommentSubmit} className="mb-10 bg-white p-xl rounded-xl border border-hairline-soft shadow-sm">
                  <label htmlFor="comment" className="block text-sm font-bold text-ink-deep mb-2">Leave a comment</label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a thoughtful comment..."
                    className="w-full p-md border border-hairline rounded-lg outline-none focus:border-primary text-sm text-ink-deep"
                    required
                  />
                  <div className="flex items-center justify-between mt-sm">
                    {commentMsg && <span className="text-xs text-primary font-bold">{commentMsg}</span>}
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="ml-auto px-xl py-sm bg-primary text-white text-xs font-bold rounded-lg hover:shadow-md disabled:bg-primary/50 transition-all flex items-center gap-xs"
                    >
                      {submittingComment ? 'Submitting...' : 'Post Comment'}
                      <span className="material-symbols-outlined text-base">send</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-10 bg-surface-container-low p-xl rounded-xl border border-hairline-soft text-center">
                  <p className="text-secondary text-sm mb-base">You must be signed in to join the conversation.</p>
                  <button
                    onClick={() => setIsLoginFormOpen(true)}
                    className="px-xl py-sm bg-primary text-white text-xs font-bold rounded-lg hover:shadow-md transition-all"
                  >
                    Sign In to Comment
                  </button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-base">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="bg-white p-xl rounded-xl border border-hairline-soft shadow-xs">
                      <div className="flex items-center justify-between mb-sm">
                        <strong className="text-ink-deep text-sm">{comment.user_name}</strong>
                        <span className="text-[11px] text-secondary">
                          {new Date(comment.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-secondary text-sm leading-relaxed whitespace-pre-wrap">{comment.body}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary text-sm italic">No comments yet. Start the conversation!</p>
                )}
              </div>
            </div>

          </div>

          {/* Right Side: Sticky TOC & Related Posts */}
          <aside className="space-y-xl sticky top-24 hidden lg:block">
            
            {/* Table of Contents */}
            {toc.length > 0 && (
              <div className="bg-white p-xl rounded-xl border border-hairline-soft shadow-xs">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-ink-deep mb-md">
                  Table of Contents
                </h4>
                <nav className="space-y-xs text-xs font-bold text-secondary">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block transition-colors hover:text-primary ${
                        activeHeadingId === item.id ? 'text-primary border-l-2 border-primary pl-xs -ml-xs' : ''
                      } ${item.level === 3 ? 'pl-sm' : ''} ${item.level === 4 ? 'pl-md' : ''}`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="space-y-base">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-ink-deep">
                  Related Stories
                </h4>
                <div className="space-y-base">
                  {relatedPosts.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/blog/${rel.slug}`}
                      className="group block overflow-hidden rounded-xl border border-hairline-soft bg-white transition-all hover:shadow-md"
                    >
                      <div className="aspect-[16/9] overflow-hidden bg-surface-container-low">
                        <img 
                          src={getImageUrl(rel.featured_image)} 
                          alt={rel.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80';
                          }}
                        />
                      </div>
                      <div className="p-base">
                        <span className="text-[10px] font-extrabold text-primary uppercase">{rel.category?.name || 'Blog'}</span>
                        <h5 className="text-sm font-extrabold text-ink-deep leading-snug group-hover:text-primary transition-colors line-clamp-2 mt-xs">
                          {rel.title}
                        </h5>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </aside>

        </div>

      </div>
    </article>
  );
}
