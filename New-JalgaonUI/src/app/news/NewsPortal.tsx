'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export interface NewsArticle {
  id: number;
  slug?: string;
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
  const [recentNews, setRecentNews] = React.useState<NewsArticle[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'recent' | 'picks'>('recent');

  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const catsRes = await fetch(`${baseUrl}/api/v1/news/categories/`);
        if (catsRes.ok) {
          const catsData = await catsRes.json();
          setCategories(catsData);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchInitialData();
  }, []);

  React.useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        let trendingUrl = `${baseUrl}/api/v1/news/trending/`;
        let recentUrl = `${baseUrl}/api/v1/news/latest/`;

        if (activeCategory) {
          // If category is selected, we use the latest list for both to show category specific news
          // since trending endpoint might not support category filtering in backend.
          recentUrl = `${baseUrl}/api/v1/news/latest/?category=${activeCategory}`;
          trendingUrl = recentUrl; 
        }

        const trendingRes = await fetch(trendingUrl);
        const recentRes = await fetch(recentUrl);
        
        if (!trendingRes.ok || !recentRes.ok) throw new Error('Failed to fetch news');
        
        const trendingJson = await trendingRes.json();
        const recentJson = await recentRes.json();
        
        setNewsArticles(trendingJson.results || trendingJson.data || trendingJson || []);
        setRecentNews(recentJson.results || recentJson.data || recentJson || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [activeCategory]);

  const displaySidebarNews = activeTab === 'recent' ? recentNews.slice(0, 5) : newsArticles.slice(0, 5);

  return (
    <>
      <Header />
      
      {/* Category Navbar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 py-4 overflow-x-auto text-[15px] font-bold text-gray-800 scrollbar-none">
          <span 
            onClick={() => setActiveCategory(null)}
            className={`cursor-pointer whitespace-nowrap ${!activeCategory ? 'text-red-600 border-b-2 border-red-600 pb-[18px] -mb-[18px]' : 'hover:text-red-600'}`}
          >
            All News
          </span>
          {categories.map(cat => (
            <span 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.slug)}
              className={`cursor-pointer whitespace-nowrap capitalize ${activeCategory === cat.slug ? 'text-red-600 border-b-2 border-red-600 pb-[18px] -mb-[18px]' : 'hover:text-red-600'}`}
            >
              {cat.name}
            </span>
          ))}
        </div>
      </div>

      <main className="pt-10 pb-20 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
            Breaking News
          </h1>

          {loading ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined animate-spin text-5xl text-red-600 mb-4 block">progress_activity</span>
              <p className="text-gray-500 font-medium">Loading latest news...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <span className="material-symbols-outlined text-5xl text-red-400 mb-4 block">error</span>
              <p className="text-gray-700 font-medium">{error}</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-10">
              
              {/* LEFT SIDE (Featured + Grid) */}
              <div className="lg:w-[65%]">
                {newsArticles.length > 0 && (
                  <Link href={`/news/${newsArticles[0].slug || newsArticles[0].id}`} className="group block mb-10">
                    <div className="w-full aspect-[16/8] md:aspect-[2/1] overflow-hidden mb-5 bg-gray-100">
                      <img 
                        src={newsArticles[0].image || newsArticles[0].featured_image || 'https://via.placeholder.com/800x400'} 
                        alt={newsArticles[0].title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <h2 className="text-2xl md:text-[32px] leading-tight font-serif font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                      {newsArticles[0].title}
                    </h2>
                    <p className="text-gray-500 text-[15px] line-clamp-2 leading-relaxed">
                      {newsArticles[0].excerpt || newsArticles[0].short_description}
                    </p>
                  </Link>
                )}

                {/* Grid of 2 below featured */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {newsArticles.slice(1, 3).map((article: any) => (
                    <Link href={`/news/${article.slug || article.id}`} key={article.id} className="group block">
                      <div className="relative w-full aspect-[16/10] overflow-hidden mb-4 bg-gray-100">
                        <img 
                          src={article.image || article.featured_image || 'https://via.placeholder.com/400x250'} 
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2 py-1 flex items-center gap-2 rounded-sm shadow-sm">
                          <span className="uppercase">{typeof article.category === 'object' && article.category !== null ? article.category.name : (article.category || 'News')}</span>
                          <span className="opacity-60 font-normal">|</span>
                          <span className="font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {new Date(article.published_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-3">
                        {article.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDE (Sidebar) */}
              <div className="lg:w-[35%] flex flex-col">
                <div className="flex items-center gap-6 border-b-2 border-gray-100 mb-6 font-bold text-[15px]">
                  <span 
                    onClick={() => setActiveTab('recent')} 
                    className={`cursor-pointer transition-colors pb-3 border-b-2 -mb-[2px] ${activeTab === 'recent' ? 'text-red-600 border-red-600' : 'text-gray-800 border-transparent hover:text-red-600'}`}
                  >
                    Most Recent
                  </span>
                  <span 
                    onClick={() => setActiveTab('picks')} 
                    className={`cursor-pointer transition-colors pb-3 border-b-2 -mb-[2px] ${activeTab === 'picks' ? 'text-red-600 border-red-600' : 'text-gray-800 border-transparent hover:text-red-600'}`}
                  >
                    Today's Picks
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  {displaySidebarNews.map((article: any) => (
                    <Link href={`/news/${article.slug || article.id}`} key={article.id} className="group flex gap-4 items-start">
                      <div className="w-28 h-[84px] shrink-0 overflow-hidden bg-gray-100">
                        <img 
                          src={article.image || article.featured_image || 'https://via.placeholder.com/150'} 
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[17px] font-serif font-bold text-gray-900 group-hover:text-red-600 line-clamp-3 leading-snug mb-1.5 transition-colors">
                          {article.title}
                        </h4>
                        <div className="text-[12px] text-gray-500 flex flex-col gap-0.5">
                          <span>
                            {article.author_name || 'Admin'} - {new Date(article.published_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-gray-400 capitalize">
                            {typeof article.category === 'object' && article.category !== null ? article.category.name : (article.category || 'Local')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {displaySidebarNews.length === 0 && (
                    <div className="text-gray-500 text-sm">No articles available.</div>
                  )}
                </div>
              </div>
              
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
