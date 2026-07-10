"use client";

import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { AuthContext } from "@/context/AuthContext";
import CarouselAds from "@/components/CarouselAds";

interface NewsDetail {
  id: number;
  title: string;
  slug: string;
  content: string;
  short_description: string;
  featured_image: string | null;
  category: { id: number; name: string; slug: string } | null;
  author_name: string;
  published_at: string;
  view_count: number;
  comments: any[];
}

const getImageUrl = (img: any) => {
  if (!img) return "https://via.placeholder.com/600x400";
  let url = img.src || img;
  if (typeof url !== "string") return "https://via.placeholder.com/600x400";
  if (
    url.startsWith("https://127.0.0.1:") ||
    url.startsWith("https://localhost:")
  ) {
    url = url.replace("https://", "http://");
  }
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function NewsDetailClient({ slug }: { slug: string }) {
  const { isLogin, setIsLoginFormOpen } = useContext(AuthContext);
  const safeSlug = (() => {
    try {
      return encodeURIComponent(decodeURIComponent(slug));
    } catch {
      return encodeURIComponent(slug);
    }
  })();
  const [article, setArticle] = useState<NewsDetail | null>(null);
  const [trendingNews, setTrendingNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentMsg, setCommentMsg] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    setCommentMsg("");

    try {
      const token = localStorage.getItem("token");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${baseUrl}/api/v1/news/${safeSlug}/comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: commentText }),
      });

      if (res.ok) {
        setCommentMsg(
          "Comment submitted successfully! It will appear once approved.",
        );
        setCommentText("");
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
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        const res = await fetch(`${baseUrl}/api/v1/news/${safeSlug}/`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Article not found");
          throw new Error("Failed to fetch article");
        }
        const data = await res.json();
        setArticle(data);

        try {
          const trendingRes = await fetch(`${baseUrl}/api/v1/news/trending/`);
          if (trendingRes.ok) {
            const trendingData = await trendingRes.json();
            const results =
              trendingData.results || trendingData.data || trendingData || [];
            setTrendingNews(
              results.filter((item: any) => item.id !== data.id).slice(0, 5),
            );
          }
        } catch (e) {
          console.error("Failed to fetch trending news", e);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [safeSlug]);

  // Execute scripts within the news content container when the content changes
  useEffect(() => {
    if (!article || !article.content) return;

    const container = document.getElementById("news-content-container");
    if (!container) return;

    const scripts = container.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");

      // Copy all attributes
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      // Copy inner content
      if (oldScript.innerHTML) {
        newScript.innerHTML = oldScript.innerHTML;
      } else if (oldScript.textContent) {
        newScript.textContent = oldScript.textContent;
      }

      // Replace old script with new script to force execution
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [article]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="w-full flex flex-col justify-center items-center py-20">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
          error
        </span>
        <h2 className="text-2xl font-bold text-ink-deep mb-4">
          {error || "Article not found"}
        </h2>
        <Link href="/news" className="text-primary font-bold hover:underline">
          &larr; Back to News
        </Link>
      </div>
    );
  }

  return (
    <article className="w-full bg-slate-50 min-h-screen pb-24 pt-6 md:pt-10 border-t border-hairline-soft">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-12 xl:gap-16">
          {/* Left Column (Main Content) */}
          <div className="w-full">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs md:text-sm font-semibold text-secondary mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <span className="material-symbols-outlined text-[16px]">
                chevron_right
              </span>
              <Link
                href="/news"
                className="hover:text-primary transition-colors"
              >
                News
              </Link>
              <span className="material-symbols-outlined text-[16px]">
                chevron_right
              </span>
              {article.category && (
                <>
                  <Link
                    href={`/news?category=${article.category.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {article.category.name}
                  </Link>
                  <span className="material-symbols-outlined text-[16px]">
                    chevron_right
                  </span>
                </>
              )}
              <span className="text-ink-deep truncate max-w-[200px] sm:max-w-[300px]">
                {article.title}
              </span>
            </nav>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-ink-deep mb-6 leading-[1.15] tracking-tight">
              {article.title}
            </h1>

            {/* Meta Info & Share Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-hairline-soft mb-8">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="text-secondary font-medium">
                  By{" "}
                  <span className="font-bold text-ink-deep">
                    {article.author_name || "Editorial Team"}
                  </span>
                </span>
                <span className="text-secondary/50">|</span>
                <span className="text-secondary font-medium flex items-center gap-1.5">
                  Updated:{" "}
                  {new Date(
                    article.published_at || new Date(),
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                      "_blank",
                    )
                  }
                  className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                  title="Share on Facebook"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article?.title || "")}`,
                      "_blank",
                    )
                  }
                  className="w-8 h-8 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-100 transition-colors"
                  title="Share on Twitter"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `https://api.whatsapp.com/send?text=${encodeURIComponent((article?.title || "") + " " + window.location.href)}`,
                      "_blank",
                    )
                  }
                  className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                  title="Share on WhatsApp"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.002 0a12.002 12.002 0 1012.002 12.002A12.016 12.016 0 0012.002 0zm6.208 17.15c-.252.71-1.464 1.353-2.019 1.412-.553.06-1.22.18-3.926-.942-3.242-1.344-5.289-4.708-5.442-4.912-.153-.204-1.3-1.733-1.3-3.305 0-1.572.822-2.343 1.118-2.658.297-.315.647-.393.86-.393s.427.003.62.013c.193.01.455-.077.712.542.257.62.88 2.148.956 2.302.076.155.127.335.035.52-.09.183-.138.298-.276.455-.138.158-.29.336-.413.468-.137.147-.282.308-.12.588.16.28 .713 1.183 1.536 1.916 1.063.945 1.95 1.238 2.235 1.385.286.147.453.125.62-.06.168-.186.723-.842.915-1.13.193-.29.387-.242.646-.145.26.096 1.637.77 1.918.913.282.143.47.214.538.334.068.12.068.694-.184 1.404z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div className="w-[1px] h-6 bg-outline-variant mx-2"></div>
                <button
                  onClick={() => setIsSaved(true)}
                  disabled={isSaved}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 border disabled:opacity-80 disabled:cursor-not-allowed ${
                    isSaved
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-surface-container-low text-ink-deep border-outline-variant/50 hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isSaved ? "bookmark_added" : "bookmark_add"}
                  </span>
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {article.featured_image && (
              <figure className="mb-10">
                <div className="w-full bg-surface-container-low overflow-hidden shadow-sm border border-hairline-soft">
                  <img
                    src={getImageUrl(article.featured_image)}
                    alt={article.title}
                    className="w-full h-auto max-h-[600px] object-cover"
                  />
                </div>
                {article.short_description && (
                  <figcaption className="mt-3 text-xs md:text-sm text-secondary font-medium italic px-3 border-l-2 border-primary/40">
                    {article.short_description}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Article Content */}
            <div
              id="news-content-container"
              className="prose prose-lg md:prose-xl prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-none prose-img:shadow-md prose-p:leading-relaxed prose-p:text-slate-800 pb-12 border-b border-hairline-soft mb-12"
              dangerouslySetInnerHTML={{ __html: article.content || "" }}
            />

            {/* Comments Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-hairline-soft">
              <h3 className="text-3xl font-black text-ink-deep mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">
                  forum
                </span>
                Discussion ({article.comments?.length || 0})
              </h3>

              <div className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/40">
                {isLogin ? (
                  <form
                    onSubmit={handleCommentSubmit}
                    className="flex flex-col gap-4"
                  >
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all min-h-[100px] resize-y"
                      required
                    />
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-sm font-medium ${commentMsg.includes("success") ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {commentMsg}
                      </span>
                      <button
                        type="submit"
                        disabled={submittingComment || !commentText.trim()}
                        className="bg-primary hover:bg-primary-deep text-white font-bold py-2.5 px-8 rounded-full transition-colors shadow-sm disabled:opacity-50"
                      >
                        {submittingComment ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-secondary font-medium mb-4">
                      Please log in to join the discussion.
                    </p>
                    <button
                      onClick={() => setIsLoginFormOpen(true)}
                      className="bg-primary hover:bg-primary-deep text-white font-bold py-2.5 px-8 rounded-full transition-colors shadow-sm"
                    >
                      Log In to Comment
                    </button>
                  </div>
                )}
              </div>

              {article.comments && article.comments.length > 0 ? (
                <div className="space-y-6">
                  {article.comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/40 flex flex-col sm:flex-row gap-5 transition-transform hover:-translate-y-1 hover:shadow-md duration-300"
                    >
                      <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center text-primary font-bold text-xl border border-primary/10">
                        {(comment.user_name || "U")[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-ink-deep text-lg">
                            {comment.user_name}
                          </span>
                          <span className="text-sm font-semibold text-secondary bg-surface-container-low px-4 py-1.5 rounded-full">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-outline-variant/60">
                  <span className="material-symbols-outlined text-6xl text-secondary/30 mb-4 block">
                    maps_ugc
                  </span>
                  <p className="text-secondary font-semibold text-xl">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <aside className="w-full">
            <div className="sticky top-28">
              <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-ink-deep">
                <h3 className="text-lg font-black uppercase tracking-wider text-ink-deep flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">
                    bolt
                  </span>
                  Quick Reads
                </h3>
                <Link
                  href="/news"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  View All{" "}
                  <span className="material-symbols-outlined text-[14px]">
                    arrow_forward
                  </span>
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                {trendingNews.length > 0 ? (
                  trendingNews.map((news) => (
                    <Link
                      key={news.id}
                      href={`/news/${news.slug || news.id}`}
                      className="group flex flex-col gap-3 p-3 -mx-3 hover:bg-white hover:shadow-sm border border-transparent hover:border-hairline-soft transition-all"
                    >
                      {(news.image || news.featured_image) && (
                        <div className="w-full aspect-[16/9] overflow-hidden bg-surface-container-low relative">
                          <img
                            src={getImageUrl(news.image || news.featured_image)}
                            alt={news.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-ink-deep leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1">
                          {news.title}
                        </h4>
                        <span className="text-xs font-semibold text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">
                            schedule
                          </span>
                          {new Date(
                            news.published_at || news.date || new Date(),
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-center text-secondary text-sm border border-dashed border-outline-variant/60 rounded-xl">
                    No trending news available.
                  </div>
                )}
              </div>

              {/* Ad / Banner */}
              <div className="mt-8 w-full -mx-4 md:mx-0">
                <CarouselAds slot="sidebar" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
