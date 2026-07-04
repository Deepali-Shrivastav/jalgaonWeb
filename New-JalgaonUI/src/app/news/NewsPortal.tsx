'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export interface NewsArticle {
  id: number;
  category: any;
  readTime?: string;
  title: string;
  excerpt?: string;
  short_description?: string;
  image?: string;
  featured_image?: string;
  alt?: string;
}

export default function NewsPortal() {
  const [newsArticles, setNewsArticles] = React.useState<NewsArticle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/news/trending/`
          : '/api/v1/news/trending/';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch news');
        const json = await res.json();
        setNewsArticles(json.results || json.data || json || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <>
      <Header />
      <main className="pt-6 pb-16">
        {/* ─── Hero: Featured / Top Story ─── */}
        <section
          id="news-hero"
          className="max-w-container-max mx-auto px-xxl mb-16"
          aria-label="Featured news story"
        >
          <div className="relative w-full min-h-[420px] md:min-h-[500px] flex items-center justify-center overflow-hidden bg-white rounded-xl">
            <div className="absolute inset-0 hero-gradient" />
            <div className="relative z-10 w-full max-w-4xl px-base flex flex-col items-center text-center gap-8 py-16">
              <div className="space-y-4">

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-ink-deep tracking-tight leading-tight">
                  Revolutionizing Local Trade:{' '}
                  <span className="text-primary">
                    Jalgaon&apos;s Digital Transformation
                  </span>
                </h1>
                <p className="text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                  How local businesses are leveraging the new directory ecosystem
                  to reach global markets while maintaining their deep roots in
                  the Khandesh region&apos;s rich commercial heritage.
                </p>
              </div>
              <button className="bg-primary text-white px-10 py-4 rounded-full font-bold tracking-wide hover:bg-primary-deep transition-all active:scale-95 flex items-center gap-3 shadow-md">
                Read Full Article
                <span className="material-symbols-outlined">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ─── Community & Business Updates Grid ─── */}
        <section
          id="news-grid"
          className="max-w-container-max mx-auto px-xxl"
          aria-label="Community and business news articles"
        >
          <div className="flex items-baseline justify-between mb-8 border-b border-hairline-soft pb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-ink-deep">
              Community &amp; Business Updates
            </h2>
            <Link
              href="/news"
              className="text-primary font-semibold text-sm hover:underline flex items-center gap-1"
            >
              View All News
              <span className="material-symbols-outlined text-[18px]">
                keyboard_double_arrow_right
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
              <h3 className="text-lg font-bold text-ink-deep">Loading news...</h3>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">
              <span className="material-symbols-outlined text-4xl mb-4">error</span>
              <h3 className="text-lg font-bold">Failed to load news</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
              {newsArticles.map((article) => (
                <article
                  key={article.id}
                  className="article-card flex flex-col group bg-white p-6 rounded-xl border border-hairline-soft hover:border-primary transition-all duration-300 hover:shadow-lg"
                >
                  <div className="overflow-hidden rounded-lg aspect-[4/3] mb-6 bg-surface-container-low flex items-center justify-center">
                    {(article.image || article.featured_image) ? (
                      <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={article.image || article.featured_image}
                        alt={article.alt || article.title}
                        loading="lazy"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-secondary">image</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-primary font-bold text-[10px] uppercase tracking-widest">
                      {typeof article.category === 'object' && article.category !== null ? article.category.name : (article.category || 'News')}
                    </span>
                    <span className="text-secondary text-xs">
                      • {article.readTime || '3 min read'}
                    </span>
                  </div>
                  <h3 className="text-ink-deep font-bold text-lg mb-3 group-hover:text-primary transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-secondary text-sm line-clamp-3 mb-6 leading-relaxed">
                    {article.excerpt || article.short_description || 'Read the full story to learn more about this recent update.'}
                  </p>
                  <div className="mt-auto">
                    <button className="w-full py-3 px-6 rounded-full border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all active:scale-[0.98]">
                      Read More
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ─── Newsletter Subscription ─── */}
        <section
          id="news-newsletter"
          className="max-w-container-max mx-auto px-xxl mt-section"
          aria-label="Newsletter subscription"
        >
          <div className="bg-surface-container-high rounded-xl p-8 md:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 w-full overflow-hidden">
            <div className="flex-1 text-center lg:text-left min-w-0 w-full">
              <h2 className="text-2xl md:text-3xl font-bold text-ink-deep mb-3">
                Stay Updated with Jalgaon News
              </h2>
              <p className="text-secondary text-base md:text-lg leading-relaxed">
                Get the latest business leads and community updates delivered
                directly to your inbox every morning.
              </p>
            </div>
            <div className="w-full lg:w-auto flex-none max-w-md lg:min-w-[450px]">
              <form
                className="flex flex-col sm:flex-row gap-3 w-full"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  className="flex-1 w-full px-6 py-4 rounded-full border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none bg-white text-sm"
                  placeholder="Enter your email"
                  type="email"
                  aria-label="Email address for newsletter"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary-deep transition-colors active:scale-95 whitespace-nowrap shrink-0"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-[11px] text-secondary mt-3 text-center lg:text-left">
                By subscribing, you agree to our{' '}
                <Link href="#" className="underline hover:text-primary">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link href="#" className="underline hover:text-primary">
                  Terms of Service
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
