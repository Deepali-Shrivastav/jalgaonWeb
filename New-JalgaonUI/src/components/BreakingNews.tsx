'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface NewsItem {
  id: number;
  title: string;
  slug: string;
}

export default function BreakingNews() {
  const [breakingNews, setBreakingNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreaking = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/v1/news/breaking/`);
        if (res.ok) {
          const data = await res.json();
          // Handling both paginated and unpaginated responses
          setBreakingNews(data.results || data);
        }
      } catch (err) {
        console.error('Failed to fetch breaking news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBreaking();
  }, []);

  if (loading || breakingNews.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-4 border-y border-hairline-soft overflow-hidden group">
      <div className="max-w-container-max mx-auto px-xxl flex items-center gap-xl relative">
        <span className="bg-red-600 text-white px-base py-1 font-bold text-[10px] rounded-full uppercase tracking-widest flex-shrink-0 z-10 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
          Breaking News
        </span>
        <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] group-hover:[animation-play-state:paused]">
          <p className="text-on-surface text-sm font-medium flex items-center">
            {breakingNews.map((item, index) => (
              <React.Fragment key={item.id}>
                <Link href={`/news/${item.slug}`} className="hover:text-primary transition-colors duration-200">
                  {item.title}
                </Link>
                {index < breakingNews.length - 1 && <span className="mx-4 text-red-500 font-bold">•</span>}
              </React.Fragment>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
