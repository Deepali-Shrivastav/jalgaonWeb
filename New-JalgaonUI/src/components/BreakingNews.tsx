"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export interface BreakingNewsItem {
  id: number | string;
  title: string;
  slug?: string;
  category?: any;
  image?: string;
  featured_image?: string;
  created_at?: string;
  published_at?: string;
}

interface BreakingNewsProps {
  initialNews?: BreakingNewsItem[];
}

const getTodayISO = () => new Date().toISOString();

const DEFAULT_BREAKING_ITEMS: BreakingNewsItem[] = [
  {
    id: 1,
    title: "नातेवाईक = मंत्री गिरीश महाजन — नाशिक कुंभमेळ्याची 551कोटीच्या बोगस वर्क ऑर्डर देणारा महाजन जामनेरचा",
    slug: "girish-mahajan-nashik-kumbh-mela-news",
    category: "गुन्हे",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80",
    published_at: getTodayISO(),
  },
  {
    id: 2,
    title: "ड्रगविरोधात जळगाव पोलिसांची निर्णायक कारवाई; ११ लाखांचा मुद्देमाल जप्त",
    slug: "jalgaon-police-drug-action-news",
    category: "गुन्हे",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80",
    published_at: getTodayISO(),
  },
  {
    id: 3,
    title: "३ किलो गांजा, वाहन आणि मोबाईल जप्त; नशिराबाद पोलिसांची धडाकेबाज कारवाई",
    slug: "nashirabad-police-ganja-seized-news",
    category: "गुन्हे",
    image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80",
    published_at: getTodayISO(),
  },
  {
    id: 4,
    title: "जळगाव शहरात नवीन उड्डाणपूल व रस्ते विकासाला मंजुरी - वाहतूक कोंडी दूर होणार",
    slug: "jalgaon-flyover-development-project",
    category: "विकास",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80",
    published_at: getTodayISO(),
  },
  {
    id: 5,
    title: "हवामान इशारा: जळगाव जिल्ह्यात पुढील २४ तासांत मुसळधार पावसाची शक्यता",
    slug: "jalgaon-weather-rain-alert-today",
    category: "हवामान",
    image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80",
    published_at: getTodayISO(),
  },
  {
    id: 6,
    title: "जळगाव सुवर्ण बाजार: आज सोन्या-चांदीच्या भावात मोठी घसरण, पाहा नवीन दर",
    slug: "jalgaon-gold-silver-rate-update",
    category: "बाजार भाव",
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&auto=format&fit=crop&q=80",
    published_at: getTodayISO(),
  },
];

const getImageUrl = (img: any): string => {
  if (!img) return "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80";
  let url = typeof img === "object" ? img.src || img.url : img;
  if (typeof url !== "string" || !url) return "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80";
  if (url.startsWith("https://127.0.0.1:") || url.startsWith("https://localhost:")) {
    url = url.replace("https://", "http://");
  }
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function BreakingNews({ initialNews }: BreakingNewsProps) {
  const [newsItems, setNewsItems] = useState<BreakingNewsItem[]>(
    initialNews && initialNews.length > 0 ? initialNews : DEFAULT_BREAKING_ITEMS
  );

  useEffect(() => {
    if (initialNews && initialNews.length > 0) {
      setNewsItems(initialNews);
    }
  }, [initialNews]);

  const rawList = newsItems.length > 0 ? newsItems : DEFAULT_BREAKING_ITEMS;

  // Filter items to show only today's news
  const activeList = React.useMemo(() => {
    const today = new Date();
    const filtered = rawList.filter((item) => {
      const dateStr = item.published_at || item.created_at;
      if (!dateStr) return false;
      const itemDate = new Date(dateStr);
      return (
        itemDate.getDate() === today.getDate() &&
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      );
    });
    // Fallback to initial items if no database item has today's timestamp
    return filtered.length > 0 ? filtered : rawList;
  }, [rawList]);

  // Triplicate items array so multiple items are constantly visible side-by-side without gaps
  const tickerItems = [...activeList, ...activeList, ...activeList];

  return (
    <div className="w-full overflow-hidden my-4">
      <div className="flex items-center">

        {/* CONTINUOUS RIGHT-TO-LEFT MARQUEE TRACK (TRANSPARENT BG, NO BOX/BORDER) */}
        <div className="flex-1 min-w-0 overflow-hidden relative news-ticker-container py-3 sm:py-4 bg-transparent flex items-center">

          <div
            style={{ "--ticker-duration": "35s" } as React.CSSProperties}
            className="news-ticker-track whitespace-nowrap flex items-center gap-10 sm:gap-14 md:gap-16"
          >
            {tickerItems.map((item, idx) => {
              const imageUrl = getImageUrl(item.image || item.featured_image);

              return (
                <div
                  key={`ticker-item-${item.id || idx}-${idx}`}
                  className="inline-flex items-center shrink-0"
                >
                  <Link
                    href={`/news/${item.slug || item.id}`}
                    className="inline-flex items-center gap-3 sm:gap-4 group hover:opacity-90 transition-opacity"
                  >
                    {/* RECTANGULAR THUMBNAIL WITH SUBTLE ROUNDED CORNERS */}
                    <div className="relative w-16 sm:w-20 md:w-24 h-11 sm:h-13 md:h-14 shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shadow-2xs">
                      <img
                        src={imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>

                    {/* PROFESSIONAL 2-3 LINE STACKED HEADLINE TITLE */}
                    <span className="text-xs sm:text-sm md:text-base font-serif font-bold text-gray-900 group-hover:text-red-600 transition-colors whitespace-normal leading-snug line-clamp-3 max-w-[240px] sm:max-w-[300px] md:max-w-[360px]">
                      {item.title}
                    </span>
                  </Link>

                  {/* GAP SPACER BETWEEN NEWS ITEMS (RED DOT REMOVED) */}
                  <span className="px-6 sm:px-10 md:px-12 shrink-0 select-none block" aria-hidden="true" />
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}


